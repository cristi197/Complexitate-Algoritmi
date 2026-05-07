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
  initChapterNav();
  injectPageStats();
  initViewCounter();
  initLikeButton();
  initGlobalSpeedSlider();
  initAudioPlayer();
  initQuizModal();
  initScrollProgress(); /* bara de progres la scroll */
});

/* ── 8. Audio Player (Web Speech API) ──────────────────────────── */
function initAudioPlayer() {
  if (!window.speechSynthesis) return;

  /* ── Chromium detection (Chrome + Edge use online voices → ro-RO works natively) ── */
  var IS_CHROMIUM = /Chrome|Chromium/.test(navigator.userAgent);

  /* ── Cached Romanian voice ── */
  var roVoice = null;
  function loadVoice() {
    var voices = window.speechSynthesis.getVoices();
    var ro = voices.find(function (v) { return v.lang.indexOf('ro') === 0; });
    if (ro) roVoice = ro;
  }
  loadVoice(); /* Firefox has voices synchronously */
  window.speechSynthesis.onvoiceschanged = loadVoice; /* Chrome needs this */

  /* Returns true when Web Speech API can speak Romanian without extra setup:
     – a Romanian voice is installed on the OS, OR
     – we're on a Chromium browser (uses Google's online TTS for any lang) */
  function canUseWebSpeech() {
    return !!roVoice || IS_CHROMIUM;
  }

  /* ── Online TTS fallback: StreamElements (Amazon Polly Ioana — Romanian) ──
     Free, no API key, no installation. Text is chunked because the endpoint
     has a ~400-char limit per request.                                       */
  var olAudio   = null;   /* current HTMLAudioElement for online TTS */
  var olChunks  = [];     /* text chunks queued for playback */
  var olIdx     = 0;      /* current chunk index */
  var olOnEnd   = null;   /* callback when all chunks finish */

  function chunkText(text, maxLen) {
    var chunks = [];
    var remaining = text.trim();
    while (remaining.length > maxLen) {
      var slice = remaining.substring(0, maxLen);
      /* Prefer breaking at sentence boundaries, then commas */
      var cut = -1;
      ['. ', '! ', '? ', ', '].forEach(function (sep) {
        var pos = slice.lastIndexOf(sep);
        if (pos > maxLen * 0.45 && pos > cut) cut = pos + sep.length - 1;
      });
      if (cut < 0) cut = maxLen;
      chunks.push(remaining.substring(0, cut).trim());
      remaining = remaining.substring(cut).trim();
    }
    if (remaining.length > 0) chunks.push(remaining);
    return chunks;
  }

  function playNextChunk() {
    if (olIdx >= olChunks.length) {
      olAudio = null;
      if (olOnEnd) olOnEnd();
      return;
    }
    var chunk = olChunks[olIdx++];
    var url = 'https://api.streamelements.com/kappa/v2/speech?voice=Ioana&text=' +
              encodeURIComponent(chunk);
    var a = new Audio(url);
    olAudio = a;
    a.playbackRate = rate;
    a.onended  = playNextChunk;
    a.onerror  = playNextChunk; /* skip failed chunk, keep going */
    a.play().catch(playNextChunk);
  }

  function speakOnline(text, onEnd) {
    stopOnline();
    olChunks = chunkText(text, 380);
    olIdx    = 0;
    olOnEnd  = onEnd;
    playNextChunk();
  }

  function stopOnline() {
    if (olAudio) { olAudio.pause(); olAudio.src = ''; olAudio = null; }
    olChunks = []; olIdx = 0;
  }

  /* ── Clean extracted text for Romanian TTS ── */
  function cleanForSpeech(text) {
    return text
      /* Romanian-friendly rewrites of notation */
      .replace(/O\(1\)/g, 'O de 1')
      .replace(/O\(n²\)/g, 'O de n la pătrat')
      .replace(/O\(n³\)/g, 'O de n la cub')
      .replace(/O\(2ⁿ\)/g, 'O de 2 la puterea n')
      .replace(/O\(n log n\)/g, 'O de n log n')
      .replace(/O\(log n\)/g, 'O de log n')
      .replace(/O\(n\)/g, 'O de n')
      .replace(/O\(([^)]+)\)/g, 'O de $1')
      /* symbols → words */
      .replace(/[→←↑↓⇒⇐▶◀►◄⏭⏮⏸]/g, ' ')
      .replace(/[✅✓☑]/g, 'corect. ')
      .replace(/[❌✗☒]/g, 'greșit. ')
      .replace(/[⚠⚠️]/g, 'atenție. ')
      /* strip emoji (surrogate pairs U+1F000–U+1FFFF) */
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ')
      /* strip remaining BMP emoji / dingbats */
      .replace(/[\u2600-\u27BF\u2300-\u23FF]/g, ' ')
      /* HTML entities that survived cloneNode */
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ── Extract readable text from a section ── */
  function sectionText(sec) {
    var clone = sec.cloneNode(true);
    clone.querySelectorAll(
      'pre, code, table, script, style, svg, ' +
      '.vec-container, .matrix-viz, [data-role], ' +
      '.quiz-section, footer, .page-stats, ' +
      '.sort-controls, .copy-btn'
    ).forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    var raw = clone.textContent.replace(/\s+/g, ' ').trim().substring(0, 2500);
    return cleanForSpeech(raw);
  }

  var sections = [];
  document.querySelectorAll('section').forEach(function (sec) {
    if (sec.id === 'exercitii' || sec.id === 'refs') return;
    var h = sec.querySelector('h2, h3');
    var title = h ? cleanForSpeech(h.textContent) : 'Secțiune';
    var text = sectionText(sec);
    if (text.length > 80) sections.push({ title: title, text: text });
  });
  if (sections.length === 0) return;

  /* ── Estimate reading time ── */
  var totalWords = sections.reduce(function (s, sc) { return s + sc.text.split(' ').length; }, 0);
  var estMin = Math.max(1, Math.ceil(totalWords / 140));

  /* ── Toggle button ── */
  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'audio-toggle-btn';
  toggleBtn.title = 'Player audio (~' + estMin + ' min, voce română)';
  toggleBtn.innerHTML = '&#x1F50A;';
  document.body.appendChild(toggleBtn);

  /* ── Player panel ── */
  var player = document.createElement('div');
  player.id = 'audio-player';
  player.className = 'audio-player hidden';
  player.innerHTML =
    '<div class="ap-header">' +
      '<span class="ap-title">&#x1F50A; Audio ROM</span>' +
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
    stopOnline();
    cur = idx;
    playing = true;
    ui();

    function onSectionEnd() {
      if (cur < sections.length - 1) speak(cur + 1);
      else { playing = false; ui(); }
    }

    if (canUseWebSpeech()) {
      /* ── Web Speech API path (works on Chrome/Edge + OS with Romanian voice) ── */
      var utt = new SpeechSynthesisUtterance(sections[idx].text);
      utt.lang = 'ro-RO';
      utt.rate = rate;
      if (!roVoice) loadVoice();
      if (roVoice) utt.voice = roVoice;
      utt.onend  = function () { stopResumeFix(); onSectionEnd(); };
      utt.onerror = function () { stopResumeFix(); playing = false; ui(); };
      window.speechSynthesis.speak(utt);
      startResumeFix();
    } else {
      /* ── Online TTS fallback: StreamElements / Amazon Polly Ioana (Romanian) ── */
      speakOnline(sections[idx].text, onSectionEnd);
    }
  }

  document.getElementById('ap-play').addEventListener('click', function () {
    if (playing) {
      if (canUseWebSpeech()) {
        window.speechSynthesis.pause();
        stopResumeFix();
      } else if (olAudio) {
        olAudio.pause();
      }
      playing = false;
    } else if (canUseWebSpeech() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      startResumeFix();
      playing = true;
    } else if (!canUseWebSpeech() && olAudio && olAudio.paused && olAudio.src) {
      olAudio.play().catch(noop);
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
    if (playing) {
      speak(cur); /* restart current section at new rate for both paths */
    } else if (olAudio) {
      olAudio.playbackRate = rate; /* apply to queued audio even while paused */
    }
  });

  player.querySelector('.ap-close').addEventListener('click', function () {
    window.speechSynthesis.cancel(); stopResumeFix();
    stopOnline();
    playing = false;
    player.classList.add('hidden');
  });

  toggleBtn.addEventListener('click', function () {
    player.classList.toggle('hidden');
    ui();
  });

  window.addEventListener('beforeunload', function () {
    window.speechSynthesis.cancel(); stopResumeFix();
    stopOnline();
  });

  ui();
}

/* ── 9. Quiz Modal (floating button → overlay) ───────────────── */
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