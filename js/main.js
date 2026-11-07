/* Big Dream Corporation — site scripts (no dependencies) */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '8801686223735';
  var EMAIL = 'info@bigdreambd.com';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: shrink on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Highlight the nav link for the section in view ---------- */
  var navLinks = nav.querySelectorAll('a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  /* ---------- Clients marquee: duplicate the list for a seamless loop ---------- */
  var track = document.getElementById('client-list');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      track.appendChild(copy);
    });
  }

  /* ---------- Logo images: show a text badge until the file exists ---------- */
  function markMissing(img) { img.parentNode.classList.add('img-missing'); }
  function markLoaded(img) { img.parentNode.classList.remove('img-missing'); }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () { markMissing(img); });
    img.addEventListener('load', function () { markLoaded(img); });
    // already failed before this script ran (deferred lazy images report complete = false)
    if (img.complete && img.naturalWidth === 0) {
      markMissing(img);
    }
  });

  /* ---------- Hero world map ---------- */
  // Land as longitude ranges per 5° band of latitude (a stylised, dotted world).
  var LAND = [
    [80, [[-70, -15], [15, 30], [50, 65], [90, 105]]],
    [75, [[-120, -75], [-70, -20], [55, 62], [90, 115], [135, 150]]],
    [70, [[-165, -140], [-130, -70], [-55, -22], [18, 180]]],
    [65, [[-168, -95], [-88, -62], [-52, -38], [-22, -14], [12, 180]]],
    [60, [[-165, -95], [-78, -64], [-48, -42], [5, 165]]],
    [55, [[-165, -155], [-132, -83], [-78, -58], [-10, 0], [8, 140], [155, 162]]],
    [50, [[-128, -55], [-5, 1], [2, 140], [142, 144]]],
    [45, [[-124, -65], [-1, 30], [38, 48], [52, 135], [141, 144]]],
    [40, [[-124, -74], [-9, 3], [12, 17], [20, 48], [54, 125], [127, 129], [140, 142]]],
    [35, [[-121, -77], [-6, 11], [35, 120], [128, 129], [132, 140]]],
    [30, [[-116, -81], [-10, 32], [34, 48], [50, 122], [130, 131]]],
    [25, [[-112, -97], [-82, -80], [-15, 35], [38, 56], [61, 121]]],
    [20, [[-105, -87], [-76, -68], [-17, 37], [40, 58], [70, 87], [92, 110], [120, 122]]],
    [15, [[-92, -83], [-17, 40], [43, 52], [74, 80], [97, 109], [120, 124]]],
    [10, [[-86, -61], [-15, 51], [76, 80], [98, 106], [122, 126]]],
    [5, [[-78, -52], [-8, 48], [100, 104], [114, 119], [125, 126]]],
    [0, [[-80, -50], [9, 42], [98, 104], [109, 118], [120, 124], [130, 132]]],
    [-5, [[-81, -35], [11, 40], [102, 106], [120, 123], [133, 152]]],
    [-10, [[-78, -36], [13, 41], [114, 126], [132, 136], [141, 150]]],
    [-15, [[-76, -39], [12, 40], [44, 50], [124, 145]]],
    [-20, [[-70, -40], [13, 35], [44, 48], [114, 150]]],
    [-25, [[-70, -47], [15, 33], [44, 47], [113, 153]]],
    [-30, [[-72, -51], [17, 31], [115, 153]]],
    [-35, [[-72, -57], [18, 25], [116, 120], [136, 150], [173, 175]]],
    [-40, [[-73, -62], [145, 148], [172, 177]]],
    [-45, [[-74, -66], [167, 171]]],
    [-50, [[-75, -68]]],
    [-55, [[-71, -65]]]
  ];

  var HUB = { name: 'Dhaka', lon: 90.4, lat: 23.8 };
  var SOURCES = [
    { name: 'Italy', lon: 12.5, lat: 45.9, dx: -6, dy: 9, anchor: 'end' },
    { name: 'Germany', lon: 10.5, lat: 51.5, dx: -6, dy: -4, anchor: 'end' },
    { name: 'South Africa', lon: 28, lat: -26, dx: 0, dy: 16, anchor: 'middle' },
    { name: 'India', lon: 79, lat: 17.4, dx: -8, dy: 12, anchor: 'end' },
    { name: 'China', lon: 118.7, lat: 36.9, dx: -2, dy: -7, anchor: 'end' },
    { name: 'Korea', lon: 127, lat: 37.5, dx: 0, dy: 12, anchor: 'middle' },
    { name: 'Indonesia', lon: 106.8, lat: -6.2, dx: 8, dy: 12, anchor: 'start' }
  ];

  function px(lon) { return (lon + 180) * 2; }
  function py(lat) { return (80 - lat) * 2 + 10; }

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    for (var key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }

  var map = document.getElementById('world-map');
  if (map) {
    var dots = el('g', {});
    LAND.forEach(function (row) {
      var lat = row[0];
      for (var lon = -177.5; lon < 180; lon += 5) {
        var onLand = row[1].some(function (r) { return lon >= r[0] && lon <= r[1]; });
        if (onLand) dots.appendChild(el('circle', { class: 'map-dot', cx: px(lon), cy: py(lat), r: 2.6 }));
      }
    });
    map.appendChild(dots);

    var hx = px(HUB.lon), hy = py(HUB.lat);
    var routes = el('g', {});
    map.appendChild(routes);

    SOURCES.forEach(function (s, i) {
      var sx = px(s.lon), sy = py(s.lat);
      var mx = (sx + hx) / 2, my = (sy + hy) / 2;
      var dist = Math.hypot(hx - sx, hy - sy);
      // bow every arc upwards so the routes read as flight paths
      var cx = mx, cy = my - dist * 0.35;
      var delay = (0.3 + i * 0.18) + 's';

      var path = el('path', { class: 'map-route', d: 'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + hx + ' ' + hy });
      routes.appendChild(path);
      var len = Math.ceil(path.getTotalLength());
      path.style.setProperty('--len', len);
      path.style.setProperty('--delay', delay);

      var dot = el('circle', { class: 'map-source', cx: sx, cy: sy, r: 3.2 });
      dot.style.setProperty('--delay', delay);
      routes.appendChild(dot);

      var label = el('text', { class: 'map-source-label', x: sx + s.dx, y: sy + s.dy, 'text-anchor': s.anchor });
      label.textContent = s.name;
      label.style.setProperty('--delay', delay);
      routes.appendChild(label);
    });

    routes.appendChild(el('circle', { class: 'map-hub-ring', cx: hx, cy: hy, r: 5 }));
    routes.appendChild(el('circle', { class: 'map-hub', cx: hx, cy: hy, r: 5 }));
    var hubLabel = el('text', { class: 'map-hub-label', x: hx + 8, y: hy + 13 });
    hubLabel.textContent = HUB.name;
    routes.appendChild(hubLabel);

  }

  /* ---------- Quote form: send by email (contact.php) or WhatsApp ---------- */
  var form = document.getElementById('quote-form');
  var errorBox = document.getElementById('form-error');
  var success = document.getElementById('form-success');

  if (form) {
    var fields = form.elements;
    var sendBtn = document.getElementById('send-email');
    var started = document.getElementById('f-started');
    started.value = Date.now();

    function value(name) { return fields.namedItem(name).value.trim(); }

    function showError(html, focusName) {
      errorBox.innerHTML = html;
      errorBox.hidden = false;
      if (focusName) fields.namedItem(focusName).focus();
    }

    // returns true when name, phone (and email, if given) are usable
    function validate() {
      var problems = [];
      var first = null;
      [['name', 'your name'], ['phone', 'a phone number'], ['email', 'a valid email address (or leave it empty)']].forEach(function (f) {
        var input = fields.namedItem(f[0]);
        var bad = f[0] === 'email' ? !input.validity.valid : !input.value.trim();
        input.setAttribute('aria-invalid', String(bad));
        if (bad) {
          problems.push(f[1]);
          if (!first) first = f[0];
        }
      });
      if (problems.length) {
        showError('Add ' + problems.join(' and ') + ' so we can reply to you.', first);
        return false;
      }
      errorBox.hidden = true;
      return true;
    }

    function messageText() {
      var lines = ['Hello Big Dream, I would like a quote.', ''];
      lines.push('Name: ' + value('name'));
      if (value('company')) lines.push('Company: ' + value('company'));
      lines.push('Phone: ' + value('phone'));
      if (value('email')) lines.push('Email: ' + value('email'));
      if (value('product')) lines.push('Product: ' + value('product'));
      if (value('quantity')) lines.push('Quantity: ' + value('quantity'));
      if (value('message')) lines.push('', value('message'));
      return lines.join('\n');
    }

    function whatsappUrl() {
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(messageText());
    }

    function setBusy(busy) {
      sendBtn.disabled = busy;
      sendBtn.setAttribute('aria-busy', String(busy));
      sendBtn.textContent = busy ? 'Sending…' : 'Send enquiry';
    }

    function sendFailed(message) {
      var mailto = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quote request — ' + value('name')) +
        '&body=' + encodeURIComponent(messageText());
      showError(
        (message || 'Your enquiry could not be sent.') +
        ' You can <a href="' + whatsappUrl() + '" target="_blank" rel="noopener">send it on WhatsApp</a>' +
        ' or <a href="' + mailto + '">by email</a> instead.'
      );
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      setBusy(true);

      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          return res.json().catch(function () { return { ok: false }; });
        })
        .then(function (result) {
          setBusy(false);
          if (!result.ok) {
            sendFailed(result.message);
            return;
          }
          document.getElementById('form-success-text').textContent = result.message;
          form.hidden = true;
          success.hidden = false;
          success.focus();
        })
        .catch(function () {
          setBusy(false);
          sendFailed('Your enquiry could not be sent. Check your connection.');
        });
    });

    document.getElementById('send-whatsapp').addEventListener('click', function () {
      if (!validate()) return;
      window.open(whatsappUrl(), '_blank', 'noopener');
    });

    document.getElementById('form-again').addEventListener('click', function () {
      form.reset();
      started.value = Date.now();
      success.hidden = true;
      form.hidden = false;
      fields.namedItem('name').focus();
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  if (reduceMotion && track) track.style.animation = 'none';
})();
