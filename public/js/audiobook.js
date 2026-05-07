/* ════════════════════════════════════════════════════════════════
   audiobook.js — Player audio tip audiobook cu sincronizare text
   ────────────────────────────────────────────────────────────────
   Utilizare: adaugă în HTML-ul capitolului:
     <div data-audiobook="../data/lectie.json" hidden></div>
     <script src="../js/audiobook.js"></script>

   Format JSON (data/lectie.json):
   {
     "title": "Titlul lecției",
     "sections": [
       {
         "id":        "id-sectiune-dom",
         "title":     "Titlu secțiune",
         "audioFile": "../audio/capitol/fisier.mp3",
         "startTime": 0,
         "endTime":   145
       }, ...
     ]
   }

   Notă: mai multe secțiuni pot referi același audioFile (timestamps
   diferite în același fișier) SAU fișiere diferite.
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── State ─────────────────────────────────────────────────── */
  var lesson   = null;   // JSON-ul lecției
  var audio    = null;   // HTMLAudioElement
  var tracks   = [];     // [{ file, sections[] }]  — grupat după audioFile
  var allSecs  = [];     // secțiuni aplatizate cu trackIndex
  var curTrack = 0;
  var curSec   = -1;
  var playing  = false;
  var rate     = 1.0;
  var listOpen = false;
  var dragging = false;

  /* ─── Init ──────────────────────────────────────────────────── */
  function init() {
    var anchor = document.querySelector('[data-audiobook]');
    if (!anchor) return;

    var url = anchor.getAttribute('data-audiobook');
    if (!url) return;

    /* fetch nu funcționează pe file://, dar merge pe GitHub Pages */
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        lesson = data;
        setup();
      })
      .catch(function (e) {
        console.warn('[Audiobook] Nu s-a putut încărca JSON-ul:', url, e.message);
      });
  }

  /* ─── Setup ─────────────────────────────────────────────────── */
  function setup() {
    /* Grupăm secțiunile după audioFile, păstrând ordinea */
    var fileOrder = [];
    var fileMap   = Object.create(null);

    (lesson.sections || []).forEach(function (sec) {
      var f = sec.audioFile || '';
      if (!fileMap[f]) {
        fileMap[f] = [];
        fileOrder.push(f);
      }
      fileMap[f].push(sec);
    });

    fileOrder.forEach(function (f) {
      tracks.push({ file: f, sections: fileMap[f] });
    });

    /* Secțiuni aplatizate */
    tracks.forEach(function (tr, ti) {
      tr.sections.forEach(function (sec) {
        allSecs.push({
          id:        sec.id        || '',
          title:     sec.title     || sec.id,
          startTime: sec.startTime || 0,
          endTime:   sec.endTime   || 0,
          trackIndex: ti
        });
      });
    });

    if (allSecs.length === 0) return;

    /* Element audio */
    audio = document.createElement('audio');
    audio.preload       = 'metadata';
    audio.playbackRate  = rate;

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('error',          onAudioError);
    audio.addEventListener('play',           function () { playing = true;  syncPlayBtn(); });
    audio.addEventListener('pause',          function () { playing = false; syncPlayBtn(); });
    audio.addEventListener('loadedmetadata', syncProgress);

    /* Construim UI-ul */
    buildUI();

    /* Marcăm secțiunile din DOM pentru highlight */
    allSecs.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) el.classList.add('ab-sec-target');
    });

    /* Ascundem TTS-ul vechi pe paginile cu audio real */
    suppressTTS();

    /* Preîncărcăm metadate pentru primul track */
    loadTrack(0, false);
  }

  /* ─── Track management ──────────────────────────────────────── */
  function loadTrack(ti, autoPlay) {
    if (ti < 0 || ti >= tracks.length) return;
    curTrack   = ti;
    audio.src  = tracks[ti].file;
    audio.load();
    if (autoPlay) {
      var onCan = function () {
        audio.removeEventListener('canplay', onCan);
        audio.play().catch(noop);
      };
      audio.addEventListener('canplay', onCan);
    }
  }

  /* ─── Audio events ──────────────────────────────────────────── */
  function onTimeUpdate() {
    if (!dragging) syncProgress();
    syncActiveSec();
  }

  function onEnded() {
    /* Trecem la următorul track dacă există */
    if (curTrack < tracks.length - 1) {
      loadTrack(curTrack + 1, true);
    } else {
      playing = false;
      syncPlayBtn();
    }
  }

  function onAudioError() {
    console.warn('[Audiobook] Eroare audio la track', curTrack, tracks[curTrack] && tracks[curTrack].file);
    var el = document.getElementById('ab-sec-name');
    if (el) el.textContent = '⚠ Fișierul audio nu a putut fi încărcat.';
    playing = false;
    syncPlayBtn();
  }

  /* ─── Sincronizare secțiune activă ─────────────────────────── */
  function syncActiveSec() {
    var t          = audio.currentTime;
    var trSections = tracks[curTrack].sections;
    var found      = -1;

    for (var i = 0; i < trSections.length; i++) {
      var s = trSections[i];
      /* Ultima secțiune din track rămâne activă până la ended */
      var isLast = (i === trSections.length - 1);
      if (t >= s.startTime && (t < s.endTime || isLast)) {
        /* Căutăm indexul global */
        for (var j = 0; j < allSecs.length; j++) {
          if (allSecs[j].trackIndex === curTrack && allSecs[j].id === s.id) {
            found = j;
            break;
          }
        }
        break;
      }
    }

    if (found !== curSec) {
      curSec = found;
      syncHighlight(found);
      syncListActive(found);
      syncInfoRow(found);
    }
  }

  /* ─── Build UI ──────────────────────────────────────────────── */
  function buildUI() {
    var panel = document.createElement('div');
    panel.id              = 'ab-player';
    panel.className       = 'ab-player';
    panel.setAttribute('role',       'region');
    panel.setAttribute('aria-label', 'Player Audiobook');
    panel.innerHTML = playerHTML();
    document.body.appendChild(panel);

    /* Body class → CSS ridică butoanele flotante */
    document.body.classList.add('has-audiobook');

    buildSectionList();
    wireEvents(panel);
  }

  function playerHTML() {
    var title = esc(lesson.title || 'Lecție');
    return (
      /* ── Info row ── */
      '<div class="ab-info-row">' +
        '<div class="ab-track-info">' +
          '<div class="ab-lesson-lbl">' + title + '</div>' +
          '<div id="ab-sec-name" class="ab-sec-name">Apas\u0103 \u25B6 pentru a \u00EEncepe</div>' +
        '</div>' +
        '<div class="ab-top-btns">' +
          '<button class="ab-icon-btn" id="ab-list-btn" title="Lista sec\u021Biunilor (L)">&#x2630;</button>' +
          '<button class="ab-icon-btn" id="ab-close-btn" title="Ascunde player">&#x2715;</button>' +
        '</div>' +
      '</div>' +

      /* ── Progress row ── */
      '<div class="ab-prog-row">' +
        '<span class="ab-time" id="ab-cur">0:00</span>' +
        '<div class="ab-prog-track" id="ab-prog-track" role="slider" ' +
          'aria-label="Progres audio" aria-valuemin="0" aria-valuemax="100" ' +
          'aria-valuenow="0" tabindex="0">' +
          '<div class="ab-prog-fill" id="ab-prog-fill"></div>' +
          '<div class="ab-prog-thumb" id="ab-prog-thumb"></div>' +
        '</div>' +
        '<span class="ab-time" id="ab-dur">0:00</span>' +
      '</div>' +

      /* ── Controls row ── */
      '<div class="ab-ctrl-row">' +
        '<button class="ab-btn ab-prev-btn" id="ab-prev" title="Sec\u021Biunea anterioar\u0103">&#x23EE;</button>' +
        '<button class="ab-btn ab-skip-btn" id="ab-back10" title="-10 secunde">&#x21BA;10s</button>' +
        '<button class="ab-btn ab-play-btn" id="ab-play" title="Red\u0103 (Spa\u021Biu)">&#x25B6;</button>' +
        '<button class="ab-btn ab-skip-btn" id="ab-fwd10" title="+10 secunde">10s&#x21BB;</button>' +
        '<button class="ab-btn ab-next-btn" id="ab-next" title="Sec\u021Biunea urm\u0103toare">&#x23ED;</button>' +
        '<div class="ab-speeds">' +
          '<button class="ab-spd" data-r="0.75">0.75\u00D7</button>' +
          '<button class="ab-spd ab-spd-on" data-r="1">1\u00D7</button>' +
          '<button class="ab-spd" data-r="1.25">1.25\u00D7</button>' +
          '<button class="ab-spd" data-r="1.5">1.5\u00D7</button>' +
        '</div>' +
      '</div>' +

      /* ── Section list (collapsible) ── */
      '<div class="ab-sec-list" id="ab-sec-list"></div>'
    );
  }

  function buildSectionList() {
    var list = document.getElementById('ab-sec-list');
    if (!list) return;

    list.innerHTML = allSecs.map(function (s, i) {
      return (
        '<div class="ab-li" data-i="' + i + '">' +
          '<span class="ab-li-n">' + (i + 1) + '</span>' +
          '<span class="ab-li-title">' + esc(s.title) + '</span>' +
          '<span class="ab-li-t">' + fmt(s.startTime) + '</span>' +
        '</div>'
      );
    }).join('');

    list.addEventListener('click', function (e) {
      var item = e.target.closest('.ab-li');
      if (!item) return;
      goToSec(parseInt(item.getAttribute('data-i'), 10), true);
    });
  }

  /* ─── Wire events ───────────────────────────────────────────── */
  function wireEvents(panel) {
    /* Play / Pause */
    document.getElementById('ab-play').addEventListener('click', togglePlay);

    /* Skip ±10s */
    document.getElementById('ab-back10').addEventListener('click', function () {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    document.getElementById('ab-fwd10').addEventListener('click', function () {
      if (isFinite(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      }
    });

    /* Prev / Next section */
    document.getElementById('ab-prev').addEventListener('click', function () {
      if (curSec > 0) goToSec(curSec - 1, playing);
      else if (curSec === 0) { audio.currentTime = allSecs[0].startTime; }
    });
    document.getElementById('ab-next').addEventListener('click', function () {
      if (curSec < allSecs.length - 1) goToSec(curSec + 1, playing);
    });

    /* Speed buttons */
    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('.ab-spd');
      if (!btn) return;
      rate = parseFloat(btn.getAttribute('data-r'));
      audio.playbackRate = rate;
      panel.querySelectorAll('.ab-spd').forEach(function (b) {
        b.classList.toggle('ab-spd-on', b === btn);
      });
    });

    /* Section list toggle */
    document.getElementById('ab-list-btn').addEventListener('click', toggleList);

    /* Close button → ascunde player, arată FAB de redeschidere */
    document.getElementById('ab-close-btn').addEventListener('click', function () {
      panel.classList.add('ab-hidden');
      document.body.classList.remove('has-audiobook');
      var fab = document.createElement('button');
      fab.className = 'ab-reopen-fab';
      fab.innerHTML = '&#x1F3A7;';
      fab.title     = 'Deschide player audio';
      fab.addEventListener('click', function () {
        panel.classList.remove('ab-hidden');
        document.body.classList.add('has-audiobook');
        fab.remove();
      });
      document.body.appendChild(fab);
    });

    /* ── Progress bar seek ── */
    var track = document.getElementById('ab-prog-track');

    /* Mouse */
    track.addEventListener('mousedown', function (e) {
      dragging = true;
      seekByEvent(e, track);
    });
    document.addEventListener('mousemove', function (e) {
      if (dragging) seekByEvent(e, track);
    });
    document.addEventListener('mouseup', function () { dragging = false; });

    /* Touch */
    track.addEventListener('touchstart', function (e) {
      e.preventDefault();
      dragging = true;
      seekByEvent(e.touches[0], track);
    }, { passive: false });
    track.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (dragging) seekByEvent(e.touches[0], track);
    }, { passive: false });
    track.addEventListener('touchend', function () { dragging = false; });

    /* Keyboard (nu se activează când userul scrie în input/textarea) */
    document.addEventListener('keydown', function (e) {
      var tag = (e.target || {}).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); audio.currentTime += 10; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 10); }
      if (e.key === 'l' || e.key === 'L') toggleList();
    });

    /* Oprim audio la navigare */
    window.addEventListener('beforeunload', function () {
      if (playing) audio.pause();
    });
  }

  /* ─── Navigation ────────────────────────────────────────────── */
  function goToSec(idx, autoPlay) {
    if (idx < 0 || idx >= allSecs.length) return;
    var s = allSecs[idx];

    if (s.trackIndex !== curTrack) {
      /* Alt fișier audio — reîncărcăm */
      curTrack  = s.trackIndex;
      audio.src = tracks[curTrack].file;
      audio.load();
      audio.addEventListener('loadedmetadata', function once() {
        audio.removeEventListener('loadedmetadata', once);
        audio.currentTime = s.startTime;
        if (autoPlay) audio.play().catch(noop);
      });
    } else {
      audio.currentTime = s.startTime;
      if (autoPlay) audio.play().catch(noop);
    }

    curSec = idx;
    syncHighlight(idx);
    syncListActive(idx);
    syncInfoRow(idx);
  }

  function togglePlay() {
    if (playing) {
      audio.pause();
    } else {
      /* La primul play: verificăm că avem un src încărcat */
      if (!audio.src || audio.src === window.location.href) {
        loadTrack(0, true);
        return;
      }
      audio.play().catch(noop);
    }
  }

  /* ─── Seek ──────────────────────────────────────────────────── */
  function seekByEvent(e, trackEl) {
    var rect = trackEl.getBoundingClientRect();
    var pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    var dur  = audio.duration;
    if (dur && isFinite(dur)) {
      audio.currentTime = pct * dur;
      syncProgress();
    }
  }

  /* ─── Sync: progress bar ────────────────────────────────────── */
  function syncProgress() {
    var cur = audio.currentTime || 0;
    var dur = isFinite(audio.duration) ? audio.duration : 0;
    var pct = dur > 0 ? (cur / dur) * 100 : 0;

    var fill  = document.getElementById('ab-prog-fill');
    var thumb = document.getElementById('ab-prog-thumb');
    if (fill)  fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';

    var progTrack = document.getElementById('ab-prog-track');
    if (progTrack) progTrack.setAttribute('aria-valuenow', Math.round(pct));

    var curEl = document.getElementById('ab-cur');
    var durEl = document.getElementById('ab-dur');
    if (curEl) curEl.textContent = fmt(cur);
    if (durEl) durEl.textContent = fmt(dur);
  }

  /* ─── Sync: play button ─────────────────────────────────────── */
  function syncPlayBtn() {
    var btn = document.getElementById('ab-play');
    if (!btn) return;
    btn.innerHTML = playing ? '&#x23F8;' : '&#x25B6;';
    btn.title     = playing ? 'Pauz\u0103 (Spa\u021Biu)' : 'Red\u0103 (Spa\u021Biu)';
  }

  /* ─── Sync: info row ────────────────────────────────────────── */
  function syncInfoRow(idx) {
    var el = document.getElementById('ab-sec-name');
    if (!el) return;
    el.textContent = (idx >= 0 && idx < allSecs.length) ? allSecs[idx].title : '\u2014';
  }

  /* ─── Sync: section list active item ───────────────────────── */
  function syncListActive(idx) {
    document.querySelectorAll('.ab-li').forEach(function (li) {
      var i  = parseInt(li.getAttribute('data-i'), 10);
      var on = (i === idx);
      li.classList.toggle('ab-li-on', on);
      /* Auto-scroll item activ în lista de secțiuni */
      if (on && listOpen) {
        var list = document.getElementById('ab-sec-list');
        if (list) {
          list.scrollTop = li.offsetTop - list.offsetTop - list.clientHeight / 2 + li.clientHeight / 2;
        }
      }
    });
  }

  /* ─── Sync: highlight section in reading pane ───────────────── */
  function syncHighlight(idx) {
    /* Eliminăm highlight-ul anterior */
    document.querySelectorAll('.ab-sec-target').forEach(function (el) {
      el.classList.remove('ab-active');
    });

    if (idx >= 0 && idx < allSecs.length) {
      var domEl = document.getElementById(allSecs[idx].id);
      if (!domEl) return;

      domEl.classList.add('ab-active');

      /* Auto-scroll dacă secțiunea nu e vizibilă în viewport */
      var rect        = domEl.getBoundingClientRect();
      var playerH     = (document.getElementById('ab-player') || {}).offsetHeight || 110;
      var footerH     = document.body.classList.contains('has-chapter-nav') ? 56 : 0;
      var safeBottom  = playerH + footerH + 20;
      var inView      = rect.top >= 60 && rect.bottom <= (window.innerHeight - safeBottom);

      if (!inView) {
        window.scrollTo({ top: window.scrollY + rect.top - 90, behavior: 'smooth' });
      }
    }
  }

  /* ─── Toggle section list ───────────────────────────────────── */
  function toggleList() {
    listOpen = !listOpen;
    var list = document.getElementById('ab-sec-list');
    var btn  = document.getElementById('ab-list-btn');
    if (list) list.classList.toggle('ab-sec-list-open', listOpen);
    if (btn)  btn.classList.toggle('ab-icon-on', listOpen);
    if (listOpen) syncListActive(curSec);
  }

  /* ─── Suppress TTS player ───────────────────────────────────── */
  function suppressTTS() {
    /* Amânăm 600ms să lăsăm platform.js să-și construiască elementele */
    setTimeout(function () {
      var ttsBtn   = document.querySelector('.audio-toggle-btn');
      var ttsPanel = document.getElementById('audio-player');
      if (ttsBtn)   ttsBtn.style.display   = 'none';
      if (ttsPanel) ttsPanel.style.display = 'none';
    }, 600);
  }

  /* ─── Utilities ─────────────────────────────────────────────── */
  function fmt(secs) {
    if (!secs || !isFinite(secs)) return '0:00';
    secs = Math.floor(secs);
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function noop() {}

  /* ─── Start ─────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
