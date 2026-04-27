/* ═══════════════════════════════════════════════════════════════
   platform.js — Go-to-top, Like, Vizualizări, Viteză animații
   Importat de TOATE paginile platformei.
═══════════════════════════════════════════════════════════════ */

/* ── 1. Buton "Go to Top" ────────────────────────────────────── */
function initGoToTop() {
  var btn = document.createElement('button');
  btn.id = 'go-top-btn';
  btn.className = 'go-top-btn';
  btn.title = 'Înapoi sus';
  btn.innerHTML = '&#8679;'; /* ↑ */
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 320) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── 2. FAB "Înapoi la pagina principală" ────────────────────── */
function initBackHomeButton() {
  var path = window.location.pathname;
  var isIndex = path.endsWith('index.html') ||
                path.endsWith('/') ||
                path === '' ||
                path.endsWith('Complexitate-Algoritmi/');
  if (isIndex) return;

  var isInCapitole = path.indexOf('/capitole/') !== -1 ||
                     path.indexOf('\\capitole\\') !== -1;
  var href = isInCapitole ? '../index.html' : 'index.html';

  var fab = document.createElement('a');
  fab.className = 'back-home-fab';
  fab.href = href;
  fab.title = 'Înapoi la pagina principală';
  fab.innerHTML =
    '<span class="back-home-icon">&#127968;</span>' +
    '<span class="back-home-text">Pagina principală</span>';
  document.body.appendChild(fab);
}

/* ── 3. Injectare statistici (Like + Vizualizări) ────────────── */
function injectPageStats() {
  /* Caută .page-cover-inner sau .hero */
  var target = document.querySelector('.page-cover-inner') ||
               document.querySelector('.hero');
  if (!target) return;

  var stats = document.createElement('div');
  stats.className = 'page-stats';
  stats.innerHTML =
    '<button id="like-btn" class="like-btn" title="Îmi place!">' +
      '<span class="like-icon">&#x1F90D;</span>' +
      '<span class="like-count">0</span>' +
    '</button>' +
    '<span class="view-counter">' +
      '<span>&#128065;</span>' +
      '<span id="view-num">\u00a0\u2014</span>' +
    '</span>';
  target.appendChild(stats);
}

/* ── 4. Contor vizualizări ────────────────────────────────────── */
function initViewCounter() {
  var key = 'pv_' + window.location.pathname;
  var n = (parseInt(localStorage.getItem(key)) || 0) + 1;
  try { localStorage.setItem(key, n); } catch (e) { /* incognito */ }
  var el = document.getElementById('view-num');
  if (el) el.textContent = '\u00a0' + n.toLocaleString() + ' vizualizări';
}

/* ── 5. Buton Like ───────────────────────────────────────────── */
function initLikeButton() {
  var btn = document.getElementById('like-btn');
  if (!btn) return;

  var kLikes = 'lk_' + window.location.pathname;
  var kDid   = 'ld_' + window.location.pathname;
  var likes  = parseInt(localStorage.getItem(kLikes)) || 0;
  var liked  = localStorage.getItem(kDid) === '1';

  function render() {
    btn.querySelector('.like-icon').textContent = liked ? '❤️' : '🤍';
    btn.querySelector('.like-count').textContent = likes;
    liked ? btn.classList.add('liked') : btn.classList.remove('liked');
  }
  render();

  btn.addEventListener('click', function () {
    if (liked) { likes = Math.max(0, likes - 1); liked = false; }
    else        { likes++; liked = true; }
    try {
      localStorage.setItem(kLikes, likes);
      localStorage.setItem(kDid, liked ? '1' : '0');
    } catch (e) {}
    render();
    btn.classList.remove('burst');
    void btn.offsetWidth; /* forțează reflow pentru animație */
    if (liked) btn.classList.add('burst');
  });
}

/* ── 6. Slider global de viteză animații ─────────────────────── */
window.animSpeed = 400; /* valoare implicită în ms */

function initGlobalSpeedSlider() {
  document.querySelectorAll('[data-role="speed-slider"]').forEach(function (slider) {
    /* Inițializare valoare curentă */
    window.animSpeed = 700 - parseInt(slider.value || 300);

    slider.addEventListener('input', function (e) {
      window.animSpeed = 700 - parseInt(e.target.value);
      var labels = ['Foarte lent', 'Lent', 'Normal', 'Rapid', 'Foarte rapid'];
      var idx = Math.min(4, Math.floor(parseInt(e.target.value) / 100));
      var wrap = slider.closest('.speed-wrap');
      var lbl = wrap && wrap.querySelector('.speed-label');
      if (lbl) lbl.textContent = labels[idx];
    });
  });
}

/* ── 7. Highlight secțiune activă în nav (pentru back link) ──── */
function upgradeBackLinks() {
  /* Îmbunătățim stilul linkurilor de întoarcere din page-cover */
  document.querySelectorAll('.page-cover-inner > a, .page-cover > a').forEach(function (a) {
    if (!a.classList.contains('back-link')) {
      a.classList.add('back-link');
      a.removeAttribute('style');
    }
  });
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  upgradeBackLinks();
  initGoToTop();
  initBackHomeButton();
  injectPageStats();
  initViewCounter();
  initLikeButton();
  initGlobalSpeedSlider();
});
