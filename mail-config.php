<?php
/*
 * Quote form email settings — edit this file in Hostinger's File Manager.
 *
 * 1. In hPanel → Emails, create a mailbox on your domain (e.g. info@bigdreambd.com).
 * 2. Put that address in 'from' and 'smtp_user', and its password in 'smtp_pass'.
 * 3. Put the inbox(es) that should receive enquiries in 'to'.
 *
 * This file is blocked from web access by .htaccess. Never share it.
 */
return [
    // Where enquiries are delivered. Add more addresses to the list if needed.
    'to' => ['info@bigdreambd.com'],

    // Sender shown on the email. Must be a mailbox on your own domain.
    'from'      => 'info@bigdreambd.com',
    'from_name' => 'Big Dream Website',

    // Hostinger SMTP. Leave smtp_pass empty to fall back to PHP mail() (works,
    // but more likely to land in spam).
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_user' => 'info@bigdreambd.com',
    'smtp_pass' => '', // ← type the mailbox password here

    // Spam protection: max submissions per visitor IP per hour.
    'rate_limit_per_hour' => 5,
];
