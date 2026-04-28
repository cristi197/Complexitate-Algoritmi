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

/* ── 8. Audio Player (Web Speech API) ──────────────────────────── */
function initAudioPlayer() {
  if (!window.speechSynthesis) return;

  // Extract text from each section (skip code/tables)
  function sectionText(sec) {
    var clone = sec.cloneNode(true);
    clone.querySelectorAll('pre, code, table, script, style, svg, .vec-container, .matrix-viz, [data-role], .quiz-section').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    return clone.textContent.replace(/\s+/g, ' ').trim().substring(0, 2000);
  }

  var sections = [];
  document.querySelectorAll('section').forEach(function (sec) {
    var h = sec.querySelector('h2, h3');
    var title = h ? h.textContent.trim() : 'Secțiune';
    var text = sectionText(sec);
    if (text.length > 80) sections.push({ title: title, text: text });
  });
  if (sections.length === 0) return;

  // Estimate time: ~160 words/min, adjust for 0.75x native = slower
  var totalWords = sections.reduce(function (s, sc) { return s + sc.text.split(' ').length; }, 0);
  var estMin = Math.max(1, Math.ceil(totalWords / 140));

  /* ── Build toggle button ── */
  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'audio-toggle-btn';
  toggleBtn.title = 'Player audio (' + estMin + ' min)';
  toggleBtn.innerHTML = '&#x1F50A;';
  document.body.appendChild(toggleBtn);

  /* ── Build player ── */
  var player = document.createElement('div');
  player.id = 'audio-player';
  player.className = 'audio-player hidden';
  player.innerHTML =
    '<div class="ap-header">' +
      '<span class="ap-title">&#x1F50A; Cititor audio</span>' +
      '<span class="ap-time">~' + estMin + ' min</span>' +
      '<button class="ap-close" title="Ascunde">&#x2715;</button>' +
    '</div>' +
    '<div class="ap-section-name">&#8212;</div>' +
    '<div class="ap-progress-wrap">' +
      '<div class="ap-progress-bar"><div class="ap-progress-fill" id="ap-fill" style="width:0%"></div></div>' +
      '<span class="ap-progress-label" id="ap-lbl">0 / ' + sections.length + ' secțiuni</span>' +
    '</div>' +
    '<div class="ap-controls">' +
      '<button class="ap-btn" id="ap-prev" title="Secțiunea anterioară">&#x23EE;</button>' +
      '<button class="ap-btn ap-play" id="ap-play">&#x25B6;</button>' +
      '<button class="ap-btn" id="ap-next" title="Secțiunea următoare">&#x23ED;</button>' +
      '<select class="ap-speed" id="ap-speed" title="Viteză">' +
        '<option value="0.5">0.5×</option>' +
        '<option value="0.75">0.75×</option>' +
        '<option value="1" selected>1×</option>' +
        '<option value="1.25">1.25×</option>' +
        '<option value="1.5">1.5×</option>' +
        '<option value="2">2×</option>' +
      '</select>' +
    '</div>';
  document.body.appendChild(player);

  var cur = 0;
  var playing = false;
  var rate = 1.0;
  var resumeTimer = null;

  function ui() {
    player.querySelector('.ap-section-name').textContent = sections[cur].title;
    var pct = Math.round((cur / sections.length) * 100);
    document.getElementById('ap-fill').style.width = pct + '%';
    document.getElementById('ap-lbl').textContent = (cur + 1) + ' / ' + sections.length + ' secțiuni';
    document.getElementById('ap-play').innerHTML = playing ? '&#x23F8;' : '&#x25B6;';
  }

  /* Chrome SpeechSynthesis bug: pauses after ~15s — fix with periodic pause/resume */
  function startResumeFix() {
    if (resumeTimer) clearInterval(resumeTimer);
    resumeTimer = setInterval(function () {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }
  function stopResumeFix() {
    if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
  }

  function speak(idx) {
    window.speechSynthesis.cancel();
    stopResumeFix();
    cur = idx;
    playing = true;
    ui();

    var utt = new SpeechSynthesisUtterance(sections[idx].text);
    utt.lang = 'ro-RO';
    utt.rate = rate;

    // Try Romanian voice
    var voices = window.speechSynthesis.getVoices();
    var roVoice = voices.find(function (v) { return v.lang.indexOf('ro') === 0; });
    if (roVoice) utt.voice = roVoice;

    utt.onend = function () {
      stopResumeFix();
      if (cur < sections.length - 1) {
        speak(cur + 1);
      } else {
        playing = false;
        ui();
      }
    };
    utt.onerror = function () { stopResumeFix(); playing = false; ui(); };

    window.speechSynthesis.speak(utt);
    startResumeFix();
  }

  document.getElementById('ap-play').addEventListener('click', function () {
    if (playing) {
      window.speechSynthesis.pause();
      stopResumeFix();
      playing = false;
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      startResumeFix();
      playing = true;
    } else {
      speak(cur);
    }
    ui();
  });

  document.getElementById('ap-prev').addEventListener('click', function () {
    var t = Math.max(0, cur - 1);
    if (playing) speak(t); else { cur = t; ui(); }
  });

  document.getElementById('ap-next').addEventListener('click', function () {
    var t = Math.min(sections.length - 1, cur + 1);
    if (playing) speak(t); else { cur = t; ui(); }
  });

  document.getElementById('ap-speed').addEventListener('change', function () {
    rate = parseFloat(this.value);
    if (playing) speak(cur);
  });

  player.querySelector('.ap-close').addEventListener('click', function () {
    window.speechSynthesis.cancel(); stopResumeFix(); playing = false;
    player.classList.add('hidden');
  });

  toggleBtn.addEventListener('click', function () {
    player.classList.toggle('hidden');
    ui();
  });

  // Reload voices async (needed in Chrome)
  window.speechSynthesis.onvoiceschanged = function () {
    var voices = window.speechSynthesis.getVoices();
    var roVoice = voices.find(function (v) { return v.lang.indexOf('ro') === 0; });
    if (roVoice) { /* stored in closure, next speak() will pick it up */ }
  };

  window.addEventListener('beforeunload', function () {
    window.speechSynthesis.cancel(); stopResumeFix();
  });

  ui();
}