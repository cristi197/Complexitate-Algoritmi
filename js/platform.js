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

/* ── 2. Navigare capitole — footer fix ───────────────────────── */
var CHAPTERS = [
  { file: 'introducere.html',  num: 0, title: 'Introducere în Informatică' },
  { file: 'complexitate.html', num: 1, title: 'Eficiența Algoritmilor' },
  { file: 'recursivitate.html',num: 2, title: 'Recursivitate' },
  { file: 'backtracking.html', num: 3, title: 'Backtracking' },
  { file: 'vectori.html',      num: 4, title: 'Vectori' },
  { file: 'matrici.html',      num: 5, title: 'Matrici' },
  { file: 'siruri.html',       num: 6, title: 'Șiruri de Caractere' },
  { file: 'fisiere.html',      num: 7, title: 'Fișiere' }
];

function initChapterNav() {
  var path = window.location.pathname.replace(/\\/g, '/');
  var curFile = path.split('/').pop();
  var curIdx  = CHAPTERS.findIndex(function (c) { return c.file === curFile; });
  if (curIdx === -1) return; /* not a chapter page (e.g. index.html) */

  /* Body needs padding so content isn't hidden behind the footer */
  document.body.classList.add('has-chapter-nav');
  document.body.style.paddingBottom = '56px';

  var prev = curIdx > 0 ? CHAPTERS[curIdx - 1] : null;
  var next = curIdx < CHAPTERS.length - 1 ? CHAPTERS[curIdx + 1] : null;

  var prevHtml = prev
    ? '<a class="cfn-btn cfn-prev" href="' + prev.file + '" title="Capitol anterior">' +
        '<span class="cfn-arrow">&#8592;</span>' +
        '<span class="cfn-label"><small>Cap. ' + prev.num + '</small><strong>' + prev.title + '</strong></span>' +
      '</a>'
    : '<span class="cfn-btn cfn-prev cfn-disabled"></span>';

  var nextHtml = next
    ? '<a class="cfn-btn cfn-next" href="' + next.file + '" title="Capitol următor">' +
        '<span class="cfn-label"><small>Cap. ' + next.num + '</small><strong>' + next.title + '</strong></span>' +
        '<span class="cfn-arrow">&#8594;</span>' +
      '</a>'
    : '<span class="cfn-btn cfn-next cfn-disabled"></span>';

  var bar = document.createElement('nav');
  bar.id  = 'chapter-footer-nav';
  bar.className = 'chapter-footer-nav';
  bar.setAttribute('aria-label', 'Navigare capitole');
  bar.innerHTML =
    prevHtml +
    '<a class="cfn-btn cfn-home" href="../index.html" title="Pagina principală">&#127968;</a>' +
    nextHtml;
  document.body.appendChild(bar);
}

/* ── 3. Injectare statistici (Like + Vizualizări) — uses InfoDB ─ */
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

/* ── 4. Contor vizualizări — integrated with InfoDB ──────────── */
function initViewCounter() {
  var el = document.getElementById('view-num');
  if (!el) return;

  var count;
  if (window.InfoDB) {
    count = window.InfoDB.analytics.getViews();
  } else {
    var key = 'pv_' + window.location.pathname;
    count = (parseInt(localStorage.getItem(key)) || 0) + 1;
    try { localStorage.setItem(key, count); } catch (e) {}
  }
  el.textContent = '\u00a0' + count.toLocaleString() + ' vizualizări';

  /* Update footer total */
  var footerViews = document.getElementById('footer-total-views');
  if (footerViews && window.InfoDB) {
    footerViews.textContent = '👁 ' + window.InfoDB.analytics.getTotalViews().toLocaleString() + ' vizualizări';
  }
}

/* ── 5. Buton Like — integrated with InfoDB ──────────────────── */
function initLikeButton() {
  var btn = document.getElementById('like-btn');
  if (!btn) return;

  var liked, likes;
  if (window.InfoDB) {
    liked = window.InfoDB.analytics.isLiked();
    likes = window.InfoDB.analytics.getTotalLikes();
  } else {
    var kLikes = 'lk_' + window.location.pathname;
    var kDid = 'ld_' + window.location.pathname;
    likes = parseInt(localStorage.getItem(kLikes)) || 0;
    liked = localStorage.getItem(kDid) === '1';
  }

  function render() {
    btn.querySelector('.like-icon').textContent = liked ? '❤️' : '🤍';
    btn.querySelector('.like-count').textContent = likes;
    liked ? btn.classList.add('liked') : btn.classList.remove('liked');
  }
  render();

  btn.addEventListener('click', function () {
    if (window.InfoDB) {
      var result = window.InfoDB.analytics.trackLike();
      liked = result.liked;
      likes = result.total;
    } else {
      if (liked) { likes = Math.max(0, likes - 1); liked = false; }
      else { likes++; liked = true; }
    }
    render();
    btn.classList.remove('burst');
    void btn.offsetWidth;
    if (liked) btn.classList.add('burst');

    /* Update footer */
    var footerLikes = document.getElementById('footer-total-likes');
    if (footerLikes && window.InfoDB) {
      footerLikes.textContent = '❤️ ' + window.InfoDB.analytics.getTotalLikes() + ' aprecieri';
    }
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
  initChapterNav();
  injectPageStats();
  initViewCounter();
  initLikeButton();
  initGlobalSpeedSlider();
  initAudioPlayer();
  initQuizModal();
  initScrollProgress();
  initChapterTracking();
});

/* ── 8. Audio Player — Now uses InfoTTS (Romanian Polly Ioana) ── */
function initAudioPlayer() {
  /* Wait for InfoTTS to be available */
  if (!window.InfoTTS) return;

  var sectionCount = window.InfoTTS.init();
  if (sectionCount === 0) return;

  var sections = window.InfoTTS.getSections();
  var totalWords = 0; /* estimate */
  var estMin = Math.max(1, Math.ceil(sectionCount * 2.5));

  /* ── Toggle button ── */
  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'tts-toggle-btn';
  toggleBtn.title = 'Ascultă lecția (~' + estMin + ' min, voce română Ioana)';
  toggleBtn.innerHTML = '🔊';
  document.body.appendChild(toggleBtn);

  /* ── Player panel ── */
  var player = document.createElement('div');
  player.className = 'tts-player hidden';
  player.innerHTML =
    '<div class="tts-header">' +
      '<span class="tts-title">🔊 Audio Lecție</span>' +
      '<span class="tts-voice-badge">🇷🇴 Ioana</span>' +
      '<button class="tts-close" title="Ascunde">✕</button>' +
    '</div>' +
    '<div class="tts-section-name" id="tts-sec-name">Apasă ▶ pentru a începe</div>' +
    '<div class="tts-progress">' +
      '<div class="tts-progress-fill" id="tts-fill" style="width:0%"></div>' +
    '</div>' +
    '<span class="tts-progress-label" id="tts-label">0 / ' + sectionCount + ' secțiuni</span>' +
    '<div class="tts-controls">' +
      '<button class="tts-btn" id="tts-prev" title="Secțiunea anterioară">⏮</button>' +
      '<button class="tts-btn play" id="tts-play" title="Redă (Spațiu)">▶</button>' +
      '<button class="tts-btn" id="tts-next" title="Secțiunea următoare">⏭</button>' +
      '<select class="tts-speed" id="tts-speed" title="Viteză">' +
        '<option value="0.75">0.75×</option>' +
        '<option value="1" selected>1×</option>' +
        '<option value="1.25">1.25×</option>' +
        '<option value="1.5">1.5×</option>' +
      '</select>' +
    '</div>';
  document.body.appendChild(player);

  function updateUI() {
    var st = window.InfoTTS.getState();
    var secName = sections[st.sectionIndex] ? sections[st.sectionIndex].title : '—';
    document.getElementById('tts-sec-name').textContent = secName;
    var pct = Math.round(((st.sectionIndex + (st.isPlaying ? 0.5 : 0)) / sectionCount) * 100);
    document.getElementById('tts-fill').style.width = pct + '%';
    document.getElementById('tts-label').textContent = (st.sectionIndex + 1) + ' / ' + sectionCount + ' secțiuni';
    document.getElementById('tts-play').innerHTML = (st.isPlaying && !st.isPaused) ? '⏸' : '▶';
  }

  /* Events */
  window.InfoTTS.onSectionChange(updateUI);
  window.InfoTTS.onEnd(updateUI);

  document.getElementById('tts-play').addEventListener('click', function () {
    window.InfoTTS.toggle();
    updateUI();
  });

  document.getElementById('tts-prev').addEventListener('click', function () {
    window.InfoTTS.prev();
    updateUI();
  });

  document.getElementById('tts-next').addEventListener('click', function () {
    window.InfoTTS.next();
    updateUI();
  });

  document.getElementById('tts-speed').addEventListener('change', function () {
    window.InfoTTS.setRate(parseFloat(this.value));
  });

  player.querySelector('.tts-close').addEventListener('click', function () {
    window.InfoTTS.stop();
    player.classList.add('hidden');
    updateUI();
  });

  toggleBtn.addEventListener('click', function () {
    player.classList.toggle('hidden');
    updateUI();
  });

  updateUI();
}
/* ── noop helper ── */
function noop() {}

/* ── 9. Scroll Progress Bar ──────────────────────────────────── */
function initScrollProgress() {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ── 10. Chapter completion tracking ─────────────────────────── */
function initChapterTracking() {
  if (!window.InfoDB) return;
  var path = window.location.pathname.replace(/\\/g, '/');
  var curFile = path.split('/').pop();
  
  /* Only on chapter pages */
  var chapterMap = {
    'introducere.html': 'introducere',
    'complexitate.html': 'complexitate',
    'recursivitate.html': 'recursivitate',
    'backtracking.html': 'backtracking',
    'vectori.html': 'vectori',
    'matrici.html': 'matrici',
    'siruri.html': 'siruri',
    'fisiere.html': 'fisiere'
  };

  var chapterId = chapterMap[curFile];
  if (!chapterId) return;

  /* Mark chapter as read after scrolling 80% */
  var marked = false;
  window.addEventListener('scroll', function () {
    if (marked) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && (window.scrollY / h) > 0.8) {
      marked = true;
      window.InfoDB.chapters.markRead(chapterId);
    }
  }, { passive: true });
}

/* ── 11. Quiz Modal (floating button → overlay) ──────────────── */
function initQuizModal() {
  var quizEl = document.querySelector('.quiz-section[data-quiz]');
  if (!quizEl) return;

  /* Get quiz title from parent section heading */
  var parentSec = quizEl.closest('section');
  var titleEl = parentSec && parentSec.querySelector('h2');
  var rawTitle = titleEl ? titleEl.textContent : 'Quiz Capitol';
  /* Strip emoji / special chars from title for aria-label */
  var cleanTitle = rawTitle.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/[^\wăâîșțĂÂÎȘȚ \-\/]/g, '').trim();

  /* Hide the source section (quiz lives in modal now) */
  if (parentSec) parentSec.style.display = 'none';

  /* ── Build overlay ── */
  var overlay = document.createElement('div');
  overlay.id = 'quiz-modal-overlay';
  overlay.className = 'quiz-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', cleanTitle);
  overlay.innerHTML =
    '<div class="quiz-modal">' +
      '<div class="qm-header">' +
        '<span class="qm-title">&#x1F3AE; ' + cleanTitle + '</span>' +
        '<button class="qm-close" title="Închide quiz (Esc)">&#x2715;</button>' +
      '</div>' +
      '<div class="qm-body"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* Move the actual quiz element into the modal — quiz.js will init it there */
  overlay.querySelector('.qm-body').appendChild(quizEl);

  /* ── Floating "Quiz" button ── */
  var btn = document.createElement('button');
  btn.id = 'quiz-float-btn';
  btn.className = 'quiz-float-btn';
  btn.title = 'Testează-ți cunoștințele!';
  btn.innerHTML = '&#x1F3AE;<span>Quiz</span>';
  document.body.appendChild(btn);

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openModal);
  overlay.querySelector('.qm-close').addEventListener('click', closeModal);
  /* Click on backdrop closes */
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  /* Escape key closes */
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
}