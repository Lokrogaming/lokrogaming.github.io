/* LOKRO shared JS — theme, custom themes, settings, reveal, counters, filters,
   accordion, modal, lang, nav. No dependencies. Respects prefers-reduced-motion
   plus the user's motion setting. GitHub Pages safe. */
(function () {
  'use strict';
  var LANGS = ['de', 'en', 'fr', 'it', 'es', 'tr', 'la'];
  var LANG_KEY = 'lokro-language';

  /* ---------- User settings (localStorage) ----------
     lokro-settings: { cursorEgg: bool (default false), reducedMotion: bool,
                       themeId: string (default 'original') }
     lokro-themes:   array of custom/imported theme objects */
  var SETTINGS_KEY = 'lokro-settings';
  var THEMES_KEY = 'lokro-themes';
  function loadSettings() {
    try {
      var s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (s && typeof s === 'object') {
        return {
          cursorEgg: !!s.cursorEgg,
          reducedMotion: !!s.reducedMotion,
          themeId: (typeof s.themeId === 'string' && s.themeId) || 'original'
        };
      }
    } catch (e) {}
    return { cursorEgg: false, reducedMotion: false, themeId: 'original' };
  }
  function saveSettings(s) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        cursorEgg: !!s.cursorEgg,
        reducedMotion: !!s.reducedMotion,
        themeId: String(s.themeId || 'original')
      }));
    } catch (e) {}
  }
  function motionReduced() {
    try { if (loadSettings().reducedMotion) return true; } catch (e) {}
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Custom themes ----------
     A theme overrides every color variable + an optional header shadow.
     Applied as inline custom properties, so it wins over .light rules.
     While a custom theme is active the light/dark toggle is disabled
     and the cursor easter egg stays off (original theme only). */
  var THEME_VARS = ['--bg', '--bg-elev', '--bg-elev-2', '--fg', '--fg-muted',
    '--fg-dim', '--border', '--border-strong', '--grid-line', '--grid-line-strong',
    '--accent', '--cursor-accent', '--accent-dim', '--warn', '--warn-dim',
    '--gold', '--gold-dim'];
  var ORIGINAL_COLORS = {
    '--bg': '#0a0a0b', '--bg-elev': '#111113', '--bg-elev-2': '#17171a',
    '--fg': '#f2f2f0', '--fg-muted': '#9a9a9e', '--fg-dim': '#626266',
    '--border': '#1a1a1d', '--border-strong': '#2b2b30',
    '--grid-line': '#141416', '--grid-line-strong': '#1e1e22',
    '--accent': '#7fe3b4', '--cursor-accent': '#0f9e64', '--accent-dim': '#16382a',
    '--warn': '#e3b97f', '--warn-dim': '#3a2c17',
    '--gold': '#d9b876', '--gold-dim': '#38300f'
  };
  function getUserThemes() {
    try {
      var t = JSON.parse(localStorage.getItem(THEMES_KEY) || '[]');
      if (!Array.isArray(t)) return [];
      return t.filter(function (th) {
        return th && typeof th === 'object' && typeof th.id === 'string'
          && typeof th.name === 'string' && th.colors && typeof th.colors === 'object';
      });
    } catch (e) { return []; }
  }
  function saveUserThemes(list) {
    try { localStorage.setItem(THEMES_KEY, JSON.stringify(list || [])); } catch (e) {}
  }
  function findTheme(id) {
    if (!id || id === 'original') return null;
    var found = null;
    getUserThemes().forEach(function (th) { if (th.id === id) found = th; });
    return found;
  }
  function applyCustomTheme(root, theme) {
    THEME_VARS.forEach(function (k) {
      if (theme.colors && typeof theme.colors[k] === 'string' && theme.colors[k]) {
        root.style.setProperty(k, theme.colors[k]);
      }
    });
    if (theme.headerShadow) root.setAttribute('data-hshadow', '1');
    else root.removeAttribute('data-hshadow');
    syncLogosForLuminance(root);
  }
  function clearCustomTheme(root) {
    THEME_VARS.forEach(function (k) { root.style.removeProperty(k); });
    root.removeAttribute('data-hshadow');
  }
  function hexLuminance(hex) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    var h = m[1].length === 3 ? m[1].split('').map(function (c) { return c + c; }).join('') : m[1];
    var r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    function lin(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function syncLogosForLuminance(root) {
    // With a custom palette the .light class no longer decides legibility,
    // so pick the logo variant from the actual background brightness.
    var lum = null;
    try { lum = hexLuminance(root.style.getPropertyValue('--bg')); } catch (e) {}
    if (lum === null) return;
    var lightBg = lum > 0.45;
    document.querySelectorAll(lightBg ? '.dark-logo' : '.light-logo').forEach(function (el) { el.classList.add('hidden'); });
    document.querySelectorAll(lightBg ? '.light-logo' : '.dark-logo').forEach(function (el) { el.classList.remove('hidden'); });
  }

  /* ---------- Theme author links (anti-phishing) ----------
     Author URLs are never free text: they are rebuilt from a fixed
     platform allowlist + a sanitized username. */
  var AUTHOR_PLATFORMS = {
    github: { label: 'GitHub', url: function (u) { return 'https://github.com/' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 19c-4 1.2-4-2-6-2M17 22v-2.9c0-.8.3-1.4.7-1.8-2.7-.3-5.5-1.3-5.5-6a4.6 4.6 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.2s1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.3 4.3 0 0 1 .1 3.2 4.6 4.6 0 0 1 1.2 3.2c0 4.7-2.9 5.7-5.5 6 .4.4.8 1.1.8 2.2V22"/></svg>' },
    instagram: { label: 'Instagram', url: function (u) { return 'https://www.instagram.com/' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg>' },
    tiktok: { label: 'TikTok', url: function (u) { return 'https://www.tiktok.com/@' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.5 2.2 4 4.5 4.3"/></svg>' },
    youtube: { label: 'YouTube', url: function (u) { return 'https://www.youtube.com/@' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none"/></svg>' },
    twitch: { label: 'Twitch', url: function (u) { return 'https://www.twitch.tv/' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M9 20v-4M15 20v-4M8 8v3.5M13 8v3.5"/></svg>' },
    x: { label: 'X', url: function (u) { return 'https://x.com/' + u; }, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5l14 14M19 5L5 19"/></svg>' }
  };
  function sanitizeUsername(u) {
    var s = String(u || '').replace(/^@+/, '').trim().replace(/[^A-Za-z0-9._-]/g, '');
    return s.slice(0, 40);
  }
  function buildAuthorUrl(platform, username) {
    var p = AUTHOR_PLATFORMS[platform];
    var u = sanitizeUsername(username);
    if (!p || !u) return '';
    return p.url(u);
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var THEME_BY = { de: 'Erstellt von', en: 'Created by', fr: 'Créé par', it: 'Creato da', es: 'Creado por', tr: 'Oluşturan', la: 'Auctore' };
  function initThemeFooter() {
    var prev = document.querySelector('[data-theme-author]');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    var st = loadSettings();
    if (!st || st.themeId === 'original') return;
    var theme = findTheme(st.themeId);
    if (!theme || !theme.author || !theme.author.name) return;
    var url = buildAuthorUrl(theme.author.platform, theme.author.username);
    if (!url) return;
    var mount = document.querySelector('footer .max-w-6xl');
    if (!mount) return;
    var lang = (document.documentElement.lang || 'de').slice(0, 2);
    var by = THEME_BY[lang] || THEME_BY.de;
    var p = document.createElement('p');
    p.className = 'font-mono text-xs dim mt-8';
    p.setAttribute('data-theme-author', '');
    p.innerHTML = 'Theme \u201e' + escapeHtml(theme.name) + '\u201c \u00b7 ' + escapeHtml(by) + ': '
      + '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="hover:opacity-70 transition">' + escapeHtml(theme.author.name) + '</a>';
    mount.appendChild(p);
  }

  /* Applies stored settings state: motion attribute, custom theme (or none),
     toggle lock, footer author line. Safe to call repeatedly (e.g. live
     from the settings page) and on pages without a theme toggle. */
  function refreshThemeState() {
    var root = document.documentElement;
    var st = loadSettings();
    if (st.reducedMotion) root.setAttribute('data-motion', 'reduced');
    else root.removeAttribute('data-motion');
    var custom = findTheme(st.themeId);
    var toggle = document.getElementById('theme-toggle');
    if (custom) {
      applyCustomTheme(root, custom);
      if (toggle) { toggle.disabled = true; toggle.setAttribute('aria-disabled', 'true'); }
    } else {
      clearCustomTheme(root);
      if (toggle) { toggle.disabled = false; toggle.removeAttribute('aria-disabled'); }
    }
    initThemeFooter();
  }

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
    refreshThemeState();
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
    if (motionReduced() || !('IntersectionObserver' in window)) {
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
      if (motionReduced() || !isFinite(target)) { el.textContent = format(target) + suffix; return; }
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
    if (!('IntersectionObserver' in window) || motionReduced()) {
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
     strong continuous trail that dissolves after ~2.4s. Subtle background
     easter egg. Fades out over interactive elements. */
  function initCursorAura() {
    if (document.getElementById('cursor-aura')) return;
    if (motionReduced()) return;
    // Easter egg: off by default, user toggle (lokro-settings), original theme only.
    var _st = loadSettings();
    if (!_st.cursorEgg) return;
    if (_st.themeId !== 'original') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var aura = document.createElement('div');
    aura.id = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    aura.appendChild(dot);
    document.body.insertBefore(aura, document.body.firstChild);
    var x = -100, y = -100, tx = -100, ty = -100, raf = null;
    var TRAIL_LIFE = 2400, TRAIL_MAX = 48;
    function loop() {
      if (!aura.isConnected) { raf = null; return; }
      var now = performance.now();
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var trails = aura.querySelectorAll('.cursor-trail');
      trails.forEach(function (el) {
        var age = now - parseFloat(el.getAttribute('data-born'));
        var p = age / TRAIL_LIFE;
        if (p >= 1) { el.remove(); return; }
        el.style.opacity = String(0.65 * (1 - p));
        var s = 1 + p * 3.6;
        el.style.transform = 'translate(' + el.getAttribute('data-x') + 'px,' + el.getAttribute('data-y') + 'px) scale(' + s + ')';
      });
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 || aura.querySelectorAll('.cursor-trail').length) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    document.addEventListener('mousemove', function (e) {
      if (!document.body.contains(aura)) return;
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
        s.style.opacity = '0.65';
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

  /* ---------- Header sunrise glow ----------
     Static clipped glow cap at the bottom of the first hero grid:
     only its top shows, the rest is cut by the wrapper. Uses the
     theme glow color, so it follows custom themes automatically. */
  function initHeaderGlow() {
    if (document.querySelector('.header-glow-wrap')) return;
    var grids = document.querySelectorAll('section .bg-grid');
    if (!grids.length) return;
    var hero = grids[0].closest('section');
    if (!hero) return;
    try {
      if (window.getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    } catch (e) {}
    var wrap = document.createElement('div');
    wrap.className = 'header-glow-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div');
    dot.className = 'header-glow';
    wrap.appendChild(dot);
    hero.insertBefore(wrap, hero.firstChild);
  }

  /* ---------- Subtle orb parallax ---------- */
  function initOrbs() {
    if (motionReduced()) return;
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

  // Apply stored state as early as possible (no flash of wrong theme/motion).
  try { refreshThemeState(); } catch (e) {}

  // Public API for the settings page.
  window.LokroThemes = {
    THEME_VARS: THEME_VARS,
    ORIGINAL_COLORS: ORIGINAL_COLORS,
    AUTHOR_PLATFORMS: AUTHOR_PLATFORMS,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    getUserThemes: getUserThemes,
    saveUserThemes: saveUserThemes,
    findTheme: findTheme,
    sanitizeUsername: sanitizeUsername,
    buildAuthorUrl: buildAuthorUrl,
    escapeHtml: escapeHtml,
    refresh: refreshThemeState,
    reinitAura: function () { try { initCursorAura(); } catch (e) {} }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initTheme(); initReveal(); initCounters(); initFilters();
    initAccordion(); initModal(); initLang(); initNav(); initOrbs(); initCursorAura(); initHeaderGlow();
  });
})();
