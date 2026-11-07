<?php
/*
 * Big Dream Corporation — quote form handler.
 * Receives the form POST from js/main.js and emails it using the settings in mail-config.php.
 * Responds with JSON: { "ok": true|false, "message": "..." }
 */

date_default_timezone_set('Asia/Dhaka');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond($ok, $message, $status = 200) {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Send the form from the website.', 405);
}

$configFile = getenv('BD_MAIL_CONFIG') ?: __DIR__ . '/mail-config.php';
$config = require $configFile;

/* ---------- Read and clean input ---------- */

function field($key, $max = 200) {
    $value = isset($_POST[$key]) ? (string) $_POST[$key] : '';
    $value = trim(str_replace("\0", '', $value));
    return mb_substr($value, 0, $max, 'UTF-8');
}

// one-line fields must never contain line breaks (prevents header injection)
function oneLine($value) {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value));
}

$name     = oneLine(field('name', 100));
$company  = oneLine(field('company', 150));
$phone    = oneLine(field('phone', 40));
$email    = oneLine(field('email', 150));
$product  = oneLine(field('product', 100));
$quantity = oneLine(field('quantity', 100));
$message  = field('message', 3000);

/* ---------- Spam checks ---------- */

// honeypot: a hidden field real visitors never fill in
if (field('website') !== '') {
    respond(true, 'Thanks, your enquiry has been sent.');
}

// bots submit instantly; people take a few seconds
$started = (int) field('started', 20);
if ($started > 0 && (time() * 1000 - $started) < 3000) {
    respond(false, 'That was very fast. Please wait a moment and send again.', 429);
}

/* ---------- Validate ---------- */

$errors = [];
if ($name === '')  $errors[] = 'your name';
if ($phone === '' || !preg_match('/^[0-9+\-\s()]{6,25}$/', $phone)) $errors[] = 'a valid phone number';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'a valid email address (or leave it empty)';
if ($errors) {
    respond(false, 'Add ' . implode(' and ', $errors) . ' so we can reply to you.', 422);
}

/* ---------- Rate limit (valid submissions only) ---------- */

$limit = (int) ($config['rate_limit_per_hour'] ?? 5);
if ($limit > 0) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/bd_quote_' . md5($ip);
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $hits = array_filter(
            array_map('intval', explode(',', (string) file_get_contents($file))),
            function ($t) use ($now) { return $t > $now - 3600; }
        );
    }
    if (count($hits) >= $limit) {
        respond(false, 'Too many enquiries from this connection. Please call or WhatsApp us on +880 1686-223735.', 429);
    }
    $hits[] = $now;
    @file_put_contents($file, implode(',', $hits), LOCK_EX);
}

/* ---------- Build the email ---------- */

$subject = 'Quote request' . ($product !== '' ? ': ' . $product : '') . ' — ' . $name;

$lines = [
    'New quote request from bigdreambd.com',
    '',
    'Name:     ' . $name,
    'Company:  ' . ($company !== '' ? $company : '-'),
    'Phone:    ' . $phone,
    'Email:    ' . ($email !== '' ? $email : '-'),
    'Product:  ' . ($product !== '' ? $product : '-'),
    'Quantity: ' . ($quantity !== '' ? $quantity : '-'),
    '',
    'Details:',
    $message !== '' ? $message : '-',
    '',
    '---',
    'Sent ' . date('j M Y, H:i') . ' from IP ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
];
if ($email === '') {
    $lines[] = 'No email given: reply by phone or WhatsApp.';
}
$body = implode("\r\n", $lines);

$recipients = array_values(array_filter((array) $config['to']));
$replyTo = $email !== '' ? $email : null;

try {
    if (!empty($config['smtp_pass'])) {
        smtpSend($config, $recipients, $subject, $body, $replyTo);
    } else {
        phpMailSend($config, $recipients, $subject, $body, $replyTo);
    }
} catch (Exception $e) {
    error_log('Big Dream quote form: ' . $e->getMessage());
    respond(false, 'Your enquiry could not be sent. Please call or WhatsApp us on +880 1686-223735.', 500);
}

respond(true, 'Thanks, ' . $name . '. Your enquiry has been sent. We will reply within one working day.');

/* ---------- Mail helpers ---------- */

function encodeHeader($text) {
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function buildHeaders($config, $recipients, $replyTo) {
    $domain = substr(strrchr($config['from'], '@'), 1);
    $headers = [
        'Date: ' . date('r'),
        'From: ' . encodeHeader($config['from_name']) . ' <' . $config['from'] . '>',
        'To: ' . implode(', ', $recipients),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    if ($replyTo) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    return $headers;
}

function phpMailSend($config, $recipients, $subject, $body, $replyTo) {
    $headers = buildHeaders($config, $recipients, $replyTo);
    // mail() adds To and Subject itself
    $headers = array_filter($headers, function ($h) { return stripos($h, 'To:') !== 0; });
    $sent = mail(
        implode(', ', $recipients),
        encodeHeader($subject),
        chunk_split(base64_encode($body)),
        implode("\r\n", $headers),
        '-f' . $config['from']
    );
    if (!$sent) {
        throw new Exception('mail() returned false');
    }
}

function smtpSend($config, $recipients, $subject, $body, $replyTo) {
    $secure = $config['smtp_secure'] ?? 'ssl';
    $host = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $config['smtp_host'] . ':' . $config['smtp_port'];
    $fp = @stream_socket_client($host, $errno, $errstr, 15);
    if (!$fp) {
        throw new Exception("SMTP connect failed: $errstr ($errno)");
    }
    stream_set_timeout($fp, 15);

    $read = function () use ($fp) {
        $response = '';
        while (($line = fgets($fp, 515)) !== false) {
            $response .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') break; // last line of a reply
        }
        return $response;
    };
    $cmd = function ($command, $expect) use ($fp, $read) {
        if ($command !== null) fwrite($fp, $command . "\r\n");
        $response = $read();
        if (!in_array((int) substr($response, 0, 3), (array) $expect, true)) {
            throw new Exception('SMTP error after "' . substr($command ?? 'connect', 0, 20) . '": ' . trim($response));
        }
        return $response;
    };

    $cmd(null, 220);
    $ehloHost = $_SERVER['SERVER_NAME'] ?? 'localhost';
    $cmd('EHLO ' . $ehloHost, 250);
    if ($secure === 'tls') {
        $cmd('STARTTLS', 220);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new Exception('STARTTLS failed');
        }
        $cmd('EHLO ' . $ehloHost, 250);
    }
    $cmd('AUTH LOGIN', 334);
    $cmd(base64_encode($config['smtp_user']), 334);
    fwrite($fp, base64_encode($config['smtp_pass']) . "\r\n");
    $auth = $read();
    if ((int) substr($auth, 0, 3) !== 235) {
        throw new Exception('SMTP login failed — check smtp_user / smtp_pass in mail-config.php: ' . trim($auth));
    }
    $cmd('MAIL FROM:<' . $config['from'] . '>', 250);
    foreach ($recipients as $rcpt) {
        $cmd('RCPT TO:<' . $rcpt . '>', [250, 251]);
    }
    $cmd('DATA', 354);

    $headers = buildHeaders($config, $recipients, $replyTo);
    $headers[] = 'Subject: ' . encodeHeader($subject);
    // base64 body lines never start with ".", so no dot-stuffing is needed
    $data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");
    fwrite($fp, $data . ".\r\n");
    $cmd(null, 250);
    fwrite($fp, "QUIT\r\n");
    fclose($fp);
}
