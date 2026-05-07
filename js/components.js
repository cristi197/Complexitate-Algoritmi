/* ═══════════════════════════════════════════════════════════════
   components.js — Shared Component System (React/Angular-like)
   ─────────────────────────────────────────────────────────────
   Reusable components loaded dynamically across all pages.
   Usage: <div data-component="header"></div>
          <div data-component="footer"></div>
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Component Registry ─────────────────────────────────── */
  var Components = {};

  /* ── Detect base path (works from root or /capitole/) ────── */
  var path = window.location.pathname.replace(/\\/g, '/');
  var inSubfolder = path.indexOf('/capitole/') !== -1;
  var BASE = inSubfolder ? '../' : '';

  /* ══════════════════════════════════════════════════════════
     HEADER COMPONENT
  ══════════════════════════════════════════════════════════ */
  Components.header = function () {
    var currentPage = path.split('/').pop() || 'index.html';
    
    function navLink(href, text, icon, highlight) {
      var fullHref = href.startsWith('http') ? href : BASE + href;
      var isActive = currentPage === href.split('/').pop();
      var cls = 'site-nav-link' + (isActive ? ' active' : '') + (highlight ? ' nav-highlight' : '');
      return '<a href="' + fullHref + '" class="' + cls + '">' + 
        (icon ? '<span class="nav-icon">' + icon + '</span>' : '') + text + '</a>';
    }

    return '' +
      '<header class="site-header" id="site-header">' +
        '<div class="site-header-inner">' +
          '<a href="' + BASE + 'index.html" class="site-logo" aria-label="InfoLiceu — pagina principală">' +
            '<span class="site-logo-icon" aria-hidden="true">💻</span>' +
            '<span class="site-logo-name">Info<strong>Liceu</strong></span>' +
          '</a>' +
          '<button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Meniu" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
          '<nav class="site-nav" id="site-nav" aria-label="Navigare principală">' +
            navLink('index.html#capitole', 'Capitole', '📚', false) +
            navLink('index.html#complexitate', 'Complexitate', '⏱', false) +
            navLink('index.html#about', 'Resurse', '📖', false) +
            navLink('analiza-bac.html', 'Analiză BAC', '🤖', true) +
            '<div class="nav-extras">' +
              '<button class="theme-toggle" id="theme-toggle" aria-label="Schimbă tema" title="Mod întunecat/luminos">' +
                '<span class="theme-icon">🌙</span>' +
              '</button>' +
              '<div class="xp-badge" id="nav-xp-badge" title="Punctele tale de experiență">' +
                '<span class="xp-icon">⚡</span>' +
                '<span class="xp-value" id="nav-xp-value">0</span>' +
                '<span class="xp-label">XP</span>' +
              '</div>' +
            '</div>' +
          '</nav>' +
        '</div>' +
      '</header>';
  };

  /* ══════════════════════════════════════════════════════════
     FOOTER COMPONENT
  ══════════════════════════════════════════════════════════ */
  Components.footer = function () {
    return '' +
      '<footer class="site-footer">' +
        '<div class="footer-inner">' +
          '<div class="footer-brand">' +
            '<span class="footer-logo">💻 Info<strong>Liceu</strong></span>' +
            '<p>Platformă educațională pentru pregătirea examenului de Bacalaureat la Informatică.</p>' +
          '</div>' +
          '<div class="footer-links">' +
            '<div class="footer-col">' +
              '<h4>Capitole</h4>' +
              '<a href="' + BASE + 'capitole/introducere.html">Introducere</a>' +
              '<a href="' + BASE + 'capitole/complexitate.html">Complexitate</a>' +
              '<a href="' + BASE + 'capitole/recursivitate.html">Recursivitate</a>' +
              '<a href="' + BASE + 'capitole/backtracking.html">Backtracking</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h4>Mai mult</h4>' +
              '<a href="' + BASE + 'capitole/vectori.html">Vectori</a>' +
              '<a href="' + BASE + 'capitole/matrici.html">Matrici</a>' +
              '<a href="' + BASE + 'capitole/siruri.html">Șiruri</a>' +
              '<a href="' + BASE + 'capitole/fisiere.html">Fișiere</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h4>Instrumente</h4>' +
              '<a href="' + BASE + 'analiza-bac.html">🤖 Analiză BAC</a>' +
              '<a href="' + BASE + 'index.html#complexitate">📊 Big-O Referință</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<p>© 2024–2026 <strong>InfoLiceu</strong> · Creat cu 💙 pentru elevii din România</p>' +
            '<div class="footer-stats">' +
              '<span id="footer-total-views">👁 — vizualizări</span>' +
              '<span id="footer-total-likes">❤️ — aprecieri</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  };

  /* ══════════════════════════════════════════════════════════
     PROGRESS BAR COMPONENT
  ══════════════════════════════════════════════════════════ */
  Components.progressBar = function () {
    return '<div id="scroll-progress" class="scroll-progress" aria-hidden="true"></div>';
  };

  /* ══════════════════════════════════════════════════════════
     ACHIEVEMENT TOAST COMPONENT
  ══════════════════════════════════════════════════════════ */
  Components.achievementToast = function () {
    return '' +
      '<div id="achievement-toast" class="achievement-toast hidden" role="alert" aria-live="polite">' +
        '<div class="toast-icon">🏆</div>' +
        '<div class="toast-content">' +
          '<div class="toast-title"></div>' +
          '<div class="toast-desc"></div>' +
        '</div>' +
        '<button class="toast-close" aria-label="Închide">✕</button>' +
      '</div>';
  };

  /* ══════════════════════════════════════════════════════════
     RENDER COMPONENTS
  ══════════════════════════════════════════════════════════ */
  function renderComponents() {
    document.querySelectorAll('[data-component]').forEach(function (el) {
      var name = el.getAttribute('data-component');
      if (Components[name]) {
        el.outerHTML = Components[name]();
      }
    });

    /* Initialize mobile menu */
    initMobileMenu();
    /* Initialize theme toggle */
    initThemeToggle();
    /* Update XP display */
    updateNavXP();
  }

  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
      btn.classList.toggle('active');
    });
  }

  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var savedTheme = localStorage.getItem('il_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.querySelector('.theme-icon').textContent = '☀️';
    }

    btn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        btn.querySelector('.theme-icon').textContent = '🌙';
        localStorage.setItem('il_theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        btn.querySelector('.theme-icon').textContent = '☀️';
        localStorage.setItem('il_theme', 'dark');
      }
    });
  }

  function updateNavXP() {
    var el = document.getElementById('nav-xp-value');
    if (!el) return;
    var xp = parseInt(localStorage.getItem('il_total_xp')) || 0;
    el.textContent = xp;
  }

  /* ── Auto-init ────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderComponents);
  } else {
    renderComponents();
  }

  /* Export for external use */
  window.InfoComponents = {
    render: renderComponents,
    updateXP: updateNavXP
  };

})();
