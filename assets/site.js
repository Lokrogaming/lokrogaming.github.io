/* LOKRO shared JS — theme, reveal, counters, filters, accordion, modal, lang, nav.
   No dependencies. Respects prefers-reduced-motion. GitHub Pages safe. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANGS = ['de', 'en', 'fr', 'it', 'es', 'tr', 'la'];
  var LANG_KEY = 'lokro-language';

  /* ---------- Theme ---------- */
  function initTheme() {
    var root = document.documentElement;
    var knob = document.getElementById('theme-knob');
    var toggle = document.getElementById('theme-toggle');
    if (!knob || !toggle) return;
    function apply(theme) {
      if (theme === 'light') {
        root.classList.add('light');
        knob.style.transform = 'translateX(20px)';
        document.querySelectorAll('.dark-logo').forEach(function (el) { el.classList.add('hidden'); });
        document.querySelectorAll('.light-logo').forEach(function (el) { el.classList.remove('hidden'); });
      } else {
        root.classList.remove('light');
        knob.style.transform = 'translateX(0)';
        document.querySelectorAll('.light-logo').forEach(function (el) { el.classList.add('hidden'); });
        document.querySelectorAll('.dark-logo').forEach(function (el) { el.classList.remove('hidden'); });
      }
    }
    var stored = null;
    try { stored = localStorage.getItem('lokro-theme'); } catch (e) {}
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    apply(stored || (prefersLight ? 'light' : 'dark'));
    toggle.addEventListener('click', function () {
      var next = root.classList.contains('light') ? 'dark' : 'light';
      try { localStorage.setItem('lokro-theme', next); } catch (e) {}
      apply(next);
    });
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Counters (only for real numbers present in markup) ---------- */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1100;
      if (reduceMotion || !isFinite(target)) { el.textContent = format(target) + suffix; return; }
      var start = null;
      function fmt(n) { return format(Math.round(n)); }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target) + suffix;
      }
      requestAnimationFrame(step);
    }
    function format(n) {
      if (!isFinite(n)) return '0';
      // de-style thousands separator for 1000 -> 1.000, keep others plain
      if (n >= 1000) {
        try { return n.toLocaleString(document.documentElement.lang || 'de'); }
        catch (e) { return String(n); }
      }
      return String(n);
    }
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(animate); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Project filter ---------- */
  function initFilters() {
    var btns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');
    if (!btns.length || !cards.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var f = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var cat = (card.getAttribute('data-category') || '').toLowerCase();
          var show = (f === 'all' || cat === f);
          card.classList.toggle('is-hidden', !show);
          if (show) { card.classList.remove('in'); requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.add('in'); }); }); }
        });
      });
    });
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    document.querySelectorAll('.accordion-item').forEach(function (item) {
      var btn = item.querySelector('.accordion-btn');
      var panel = item.querySelector('.accordion-panel');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.accordion-item.open').forEach(function (other) {
          other.classList.remove('open');
          var p = other.querySelector('.accordion-panel');
          var b = other.querySelector('.accordion-btn');
          if (p) p.style.maxHeight = null;
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------- Modal (project details) ---------- */
  function initModal() {
    var backdrop = document.getElementById('project-modal');
    if (!backdrop) return;
    var title = backdrop.querySelector('[data-modal-title]');
    var body = backdrop.querySelector('[data-modal-body]');
    var meta = backdrop.querySelector('[data-modal-meta]');
    function open(card) {
      if (title) title.textContent = card.getAttribute('data-title') || '';
      if (meta) meta.textContent = card.getAttribute('data-meta') || '';
      if (body) body.textContent = card.getAttribute('data-details') || '';
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var card = btn.closest('.project-card');
        if (card) open(card);
      });
    });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    backdrop.querySelectorAll('[data-close-modal]').forEach(function (b) { b.addEventListener('click', close); });
  }

  /* ---------- Language ---------- */
  function currentLang() {
    var m = window.location.pathname.match(/^\/(de|en|fr|it|es|tr|la)(\/|$)/);
    return m ? m[1] : null;
  }
  function pageSuffix() {
    // returns e.g. "join.html" or "" for home, preserving subpage
    var path = window.location.pathname;
    var m = path.match(/^\/(de|en|fr|it|es|tr|la)\/?(.*)$/);
    if (!m) {
      var file = path.split('/').pop();
      if (file === 'bewerbung.html') return 'join.html'; // legacy URL
      if (file === 'join.html' || file === 'hall-of-fame.html') return file;
      return '';
    }
    if (m[2] === 'bewerbung.html') return 'join.html'; // legacy URL
    return m[2] || '';
  }
  function initLang() {
    try {
      var cur = currentLang();
      if (cur && LANGS.indexOf(cur) !== -1) localStorage.setItem(LANG_KEY, cur);
    } catch (e) {}
    document.querySelectorAll('.lang-wrap').forEach(function (wrap) {
      var btn = wrap.querySelector('.lang-btn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = wrap.classList.contains('open');
        document.querySelectorAll('.lang-wrap.open').forEach(function (w) { w.classList.remove('open'); });
        if (!wasOpen) wrap.classList.add('open');
        btn.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.lang-wrap.open').forEach(function (w) { w.classList.remove('open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.querySelectorAll('.lang-wrap.open').forEach(function (w) { w.classList.remove('open'); });
    });
    // click on option -> persist + navigate to same page in other language
    document.querySelectorAll('.lang-option[data-lang]').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        var next = opt.getAttribute('data-lang');
        if (LANGS.indexOf(next) === -1) return;
        try { localStorage.setItem(LANG_KEY, next); } catch (err) {}
        var suffix = pageSuffix();
        var hash = window.location.hash || '';
        var target = '/' + next + '/' + (suffix ? suffix : '');
        // allow default anchor behaviour for <a href>; but ensure hash kept
        if (opt.tagName.toLowerCase() === 'a') {
          e.preventDefault();
          window.location.href = target + hash;
        }
      });
    });
  }

  /* ---------- Bottom nav active ---------- */
  function initNav() {
    var path = window.location.pathname;
    var items = document.querySelectorAll('.bottom-nav-item');
    if (!items.length) return;
    items.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var label = (a.getAttribute('aria-label') || '').toLowerCase();
      a.classList.remove('active');
      if ((href.indexOf('join') !== -1 || href.indexOf('bewerbung') !== -1) && (path.indexOf('join') !== -1 || path.indexOf('bewerbung') !== -1)) a.classList.add('active');
      else if (href.indexOf('hall-of-fame') !== -1 && path.indexOf('hall-of-fame') !== -1) a.classList.add('active');
      else if ((path === '/' || /^\/(de|en|fr|it|es|tr|la)\/?$/.test(path) || path.indexOf('index') !== -1) && label.indexOf('start') !== -1) a.classList.add('active');
      else if ((path === '/' || /^\/(de|en|fr|it|es|tr|la)\/?$/.test(path)) && a.getAttribute('data-nav') === 'home') a.classList.add('active');
    });
  }

  /* ---------- Cursor aura (desktop only) ----------
     Green glow dot following the mouse behind the grid layers, with a
     continuous blurry trail that dissolves after ~2s. Subtle background
     easter egg. Fades out over interactive elements. */
  function initCursorAura() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var aura = document.createElement('div');
    aura.id = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    aura.appendChild(dot);
    document.body.insertBefore(aura, document.body.firstChild);
    var x = -100, y = -100, tx = -100, ty = -100, raf = null;
    var TRAIL_LIFE = 5000, TRAIL_MAX = 800;
    function loop() {
      var now = performance.now();
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var trails = aura.querySelectorAll('.cursor-trail');
      trails.forEach(function (el) {
        var age = now - parseFloat(el.getAttribute('data-born'));
        var p = age / TRAIL_LIFE;
        if (p >= 1) { el.remove(); return; }
        el.style.opacity = String(0.4 * (1 - p));
        var s = 1 + p * 3.2;
        el.style.transform = 'translate(' + el.getAttribute('data-x') + 'px,' + el.getAttribute('data-y') + 'px) scale(' + s + ')';
      });
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 || aura.querySelectorAll('.cursor-trail').length) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      kick();
      if (aura.classList.contains('is-dim')) return;
      if (aura.querySelectorAll('.cursor-trail').length < TRAIL_MAX) {
        var now = performance.now();
        var s = document.createElement('div');
        s.className = 'cursor-trail';
        s.setAttribute('data-born', String(now));
        s.setAttribute('data-x', String(tx));
        s.setAttribute('data-y', String(ty));
        s.style.opacity = '0.4';
        aura.appendChild(s);
      }
    });
    document.documentElement.addEventListener('mouseleave', function () {
      aura.classList.add('is-dim');
    });
    document.documentElement.addEventListener('mouseenter', function () {
      aura.classList.remove('is-dim');
    });
    var SEL = 'a, button, input, select, textarea, label, .card, .honor-card, .accordion-btn, .filter-btn, .lang-option, .bottom-nav-item';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(SEL)) aura.classList.add('is-dim');
    });
    document.addEventListener('mouseout', function (e) {
      var to = e.relatedTarget;
      if (to && to.closest && to.closest(SEL)) return;
      aura.classList.remove('is-dim');
    });
  }

  /* ---------- Subtle orb parallax ---------- */
  function initOrbs() {
    if (reduceMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var orbs = document.querySelectorAll('.orb[data-parallax]');
    if (!orbs.length) return;
    var raf = null;
    document.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var x = (e.clientX / window.innerWidth - 0.5);
        var y = (e.clientY / window.innerHeight - 0.5);
        orbs.forEach(function (o) {
          var depth = parseFloat(o.getAttribute('data-parallax') || '20');
          o.style.translate = (x * depth) + 'px ' + (y * depth) + 'px';
        });
        raf = null;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme(); initReveal(); initCounters(); initFilters();
    initAccordion(); initModal(); initLang(); initNav(); initOrbs(); initCursorAura();
  });
})();
