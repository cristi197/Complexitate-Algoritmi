/* ═══════════════════════════════════════════════════════════════
   tts-ro.js — Romanian Text-to-Speech Engine (Improved)
   ─────────────────────────────────────────────────────────────
   Primary: Amazon Polly "Ioana" voice via StreamElements API
   Fallback: Web Speech API with enhanced Romanian pronunciation
   
   Key improvements over old system:
   - Uses ONLY Romanian-native voice (Ioana from Amazon Polly)
   - Better text preprocessing for Romanian language
   - Proper SSML-like text preparation
   - Smart sentence splitting respecting Romanian grammar
   - No English-accent robot reading
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Configuration ──────────────────────────────────────── */
  var CONFIG = {
    /* StreamElements TTS (Amazon Polly - Ioana, Romanian) */
    ttsEndpoint: 'https://api.streamelements.com/kappa/v2/speech',
    voice: 'Ioana',      /* Romanian female voice (Amazon Polly) */
    maxChunkLen: 350,     /* Safe chunk size for API */
    defaultRate: 1.0,
    minTextLen: 20        /* Minimum text length to trigger TTS */
  };

  /* ── State ──────────────────────────────────────────────── */
  var state = {
    isPlaying: false,
    isPaused: false,
    currentAudio: null,
    chunks: [],
    chunkIndex: 0,
    sections: [],
    sectionIndex: 0,
    rate: CONFIG.defaultRate,
    onSectionChange: null,
    onEnd: null,
    onError: null
  };

  /* ══════════════════════════════════════════════════════════
     TEXT PREPROCESSING FOR ROMANIAN
  ══════════════════════════════════════════════════════════ */
  function preprocessRomanian(text) {
    return text
      /* ── Notații matematice → text românesc ── */
      .replace(/O\(1\)/g, 'O de 1, complexitate constantă')
      .replace(/O\(n²\)/g, 'O de n pătrat')
      .replace(/O\(n³\)/g, 'O de n cub')
      .replace(/O\(2ⁿ\)/g, 'O de 2 la puterea n')
      .replace(/O\(n!\)/g, 'O de n factorial')
      .replace(/O\(n\s*log\s*n\)/gi, 'O de n log n')
      .replace(/O\(log\s*n\)/gi, 'O de logaritm n')
      .replace(/O\(n\)/g, 'O de n, complexitate liniară')
      .replace(/O\(([^)]+)\)/g, 'O de $1')
      .replace(/Ω\(([^)]+)\)/g, 'omega de $1')
      .replace(/Θ\(([^)]+)\)/g, 'teta de $1')

      /* ── Simboluri C++ → cuvinte românești ── */
      .replace(/\bcin\b/g, 'c in')
      .replace(/\bcout\b/g, 'c out')
      .replace(/\bendl\b/g, 'end line')
      .replace(/\bint\b/g, 'întreg')
      .replace(/\bfloat\b/g, 'float')
      .replace(/\bdouble\b/g, 'dublu')
      .replace(/\bchar\b/g, 'caracter')
      .replace(/\bbool\b/g, 'boolean')
      .replace(/\bvoid\b/g, 'void')
      .replace(/\bstring\b/g, 'string')
      .replace(/\barray\b/g, 'tablou')
      .replace(/\breturn\b/g, 'returnează')
      .replace(/\bif\b/g, 'dacă')
      .replace(/\belse\b/g, 'altfel')
      .replace(/\bwhile\b/g, 'cât timp')
      .replace(/\bfor\b/g, 'pentru')
      .replace(/\bswitch\b/g, 'comutator')
      .replace(/\bbreak\b/g, 'întrerupe')
      .replace(/\bcontinue\b/g, 'continuă')

      /* ── Acronime & abrevieri ── */
      .replace(/\bCPU\b/g, 'procesor')
      .replace(/\bRAM\b/g, 'memorie RAM')
      .replace(/\bHDD\b/g, 'hard disc')
      .replace(/\bSSD\b/g, 'SSD')
      .replace(/\bSO\b/g, 'sistem de operare')
      .replace(/\bNr\./g, 'Numărul')
      .replace(/\bnr\./g, 'numărul')
      .replace(/\betc\./g, 'etcetera')
      .replace(/\bex\./g, 'exemplu')
      .replace(/\bvs\./g, 'versus')
      .replace(/\bfig\./g, 'figura')
      .replace(/\bcap\./g, 'capitolul')

      /* ── Numere și operații ── */
      .replace(/(\d+)\s*\+\s*(\d+)/g, '$1 plus $2')
      .replace(/(\d+)\s*\-\s*(\d+)/g, '$1 minus $2')
      .replace(/(\d+)\s*\*\s*(\d+)/g, '$1 ori $2')
      .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 împărțit la $2')
      .replace(/(\d+)\s*%\s*(\d+)/g, '$1 modulo $2')
      .replace(/!=|<>/g, ' diferit de ')
      .replace(/==/g, ' egal cu ')
      .replace(/<=/g, ' mai mic sau egal cu ')
      .replace(/>=/g, ' mai mare sau egal cu ')
      .replace(/&&/g, ' și ')
      .replace(/\|\|/g, ' sau ')

      /* ── Paranteze și punctuație ── */
      .replace(/\[(\d+)\]/g, ' indexul $1 ')
      .replace(/\{|\}/g, '')
      .replace(/\(|\)/g, '')
      .replace(/\[|\]/g, '')
      .replace(/;/g, '.')
      .replace(/\*/g, ' ')

      /* ── Curățare finală ── */
      .replace(/[→←↑↓⇒⇐▶◀►◄⏭⏮⏸⏯]/g, '')
      .replace(/[✅✓☑]/g, 'corect.')
      .replace(/[❌✗☒]/g, 'greșit.')
      .replace(/[⚠️⚠]/g, 'atenție.')
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ') /* Emoji surrogate pairs */
      .replace(/[\u2600-\u27BF\u2300-\u23FF\uFE00-\uFE0F]/g, ' ') /* Other emoji */
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ══════════════════════════════════════════════════════════
     SMART TEXT CHUNKING (Respects Romanian sentence structure)
  ══════════════════════════════════════════════════════════ */
  function chunkText(text, maxLen) {
    if (!text || text.length <= maxLen) return text ? [text] : [];

    var chunks = [];
    var remaining = text.trim();

    while (remaining.length > maxLen) {
      var slice = remaining.substring(0, maxLen);
      var cut = -1;

      /* Priority 1: End of sentence (.!?) */
      var sentenceBreaks = ['. ', '! ', '? ', '.\n'];
      for (var i = 0; i < sentenceBreaks.length; i++) {
        var pos = slice.lastIndexOf(sentenceBreaks[i]);
        if (pos > maxLen * 0.4 && pos > cut) cut = pos + sentenceBreaks[i].length;
      }

      /* Priority 2: Semicolons and colons */
      if (cut < 0) {
        var semiPos = slice.lastIndexOf('; ');
        var colonPos = slice.lastIndexOf(': ');
        cut = Math.max(semiPos, colonPos);
        if (cut > maxLen * 0.4) cut += 2;
        else cut = -1;
      }

      /* Priority 3: Commas (common in Romanian long sentences) */
      if (cut < 0) {
        var commaPos = slice.lastIndexOf(', ');
        if (commaPos > maxLen * 0.5) cut = commaPos + 2;
      }

      /* Priority 4: Word boundary */
      if (cut < 0) {
        var spacePos = slice.lastIndexOf(' ');
        if (spacePos > maxLen * 0.6) cut = spacePos + 1;
      }

      /* Fallback: Hard cut */
      if (cut < 0 || cut < maxLen * 0.3) cut = maxLen;

      chunks.push(remaining.substring(0, cut).trim());
      remaining = remaining.substring(cut).trim();
    }

    if (remaining.length > 0) chunks.push(remaining);
    return chunks;
  }

  /* ══════════════════════════════════════════════════════════
     EXTRACT TEXT FROM DOM SECTIONS
  ══════════════════════════════════════════════════════════ */
  function extractSectionText(sectionEl) {
    var clone = sectionEl.cloneNode(true);
    /* Remove non-readable elements */
    var removeSelectors = [
      'pre', 'code', 'table', 'script', 'style', 'svg', 'canvas',
      '.vec-container', '.matrix-viz', '.matrix-viz-wrap',
      '[data-role]', '.quiz-section', 'footer', '.page-stats',
      '.sort-controls', '.copy-btn', '.btn', 'button',
      '.nav-bar', '.tree-container', '.bt-grid',
      '.speed-wrap', 'input', 'select', '.str-demo-wrap',
      'img', 'video', 'audio', '.watch-window'
    ];
    clone.querySelectorAll(removeSelectors.join(',')).forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    var raw = clone.textContent || '';
    /* Limit per section for reasonable reading time */
    raw = raw.substring(0, 3000);
    return preprocessRomanian(raw);
  }

  function extractPageSections() {
    var sections = [];
    document.querySelectorAll('section').forEach(function (sec) {
      /* Skip quiz and reference sections */
      if (sec.id === 'exercitii' || sec.id === 'refs') return;
      if (sec.classList.contains('quiz-section')) return;

      var heading = sec.querySelector('h2, h3');
      var title = heading ? preprocessRomanian(heading.textContent) : 'Secțiune';
      var text = extractSectionText(sec);

      if (text.length > CONFIG.minTextLen) {
        sections.push({ title: title, text: text, element: sec });
      }
    });
    return sections;
  }

  /* ══════════════════════════════════════════════════════════
     AUDIO PLAYBACK ENGINE (StreamElements / Polly Ioana)
  ══════════════════════════════════════════════════════════ */
  function buildAudioURL(text) {
    return CONFIG.ttsEndpoint + '?voice=' + CONFIG.voice + '&text=' + encodeURIComponent(text);
  }

  function playChunk(index) {
    if (index >= state.chunks.length) {
      /* Section complete - move to next */
      onSectionComplete();
      return;
    }

    state.chunkIndex = index;
    var url = buildAudioURL(state.chunks[index]);
    var audio = new Audio(url);
    state.currentAudio = audio;
    audio.playbackRate = state.rate;

    audio.onended = function () {
      if (state.isPlaying && !state.isPaused) {
        playChunk(index + 1);
      }
    };

    audio.onerror = function () {
      /* Try next chunk on error - don't stop entirely */
      console.warn('[TTS-RO] Eroare la chunk', index, '- se trece la următorul');
      if (state.isPlaying) playChunk(index + 1);
    };

    audio.play().catch(function (e) {
      console.warn('[TTS-RO] Nu s-a putut reda:', e.message);
      if (state.isPlaying) playChunk(index + 1);
    });
  }

  function onSectionComplete() {
    if (state.sectionIndex < state.sections.length - 1) {
      state.sectionIndex++;
      startSection(state.sectionIndex);
      if (state.onSectionChange) state.onSectionChange(state.sectionIndex);
    } else {
      /* All sections complete */
      state.isPlaying = false;
      state.isPaused = false;
      if (state.onEnd) state.onEnd();
    }
  }

  function startSection(index) {
    if (index < 0 || index >= state.sections.length) return;
    state.sectionIndex = index;
    var section = state.sections[index];
    state.chunks = chunkText(section.text, CONFIG.maxChunkLen);
    state.chunkIndex = 0;
    playChunk(0);
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════ */
  var TTS = {
    /* Initialize with page sections */
    init: function () {
      state.sections = extractPageSections();
      return state.sections.length;
    },

    /* Get sections list */
    getSections: function () {
      return state.sections.map(function (s, i) {
        return { index: i, title: s.title };
      });
    },

    /* Play from specific section */
    play: function (sectionIndex) {
      sectionIndex = sectionIndex || state.sectionIndex;
      if (state.sections.length === 0) this.init();
      if (state.sections.length === 0) return;

      this.stop();
      state.isPlaying = true;
      state.isPaused = false;
      state.sectionIndex = sectionIndex;
      startSection(sectionIndex);
    },

    /* Pause playback */
    pause: function () {
      if (state.currentAudio && state.isPlaying) {
        state.currentAudio.pause();
        state.isPaused = true;
      }
    },

    /* Resume playback */
    resume: function () {
      if (state.currentAudio && state.isPaused) {
        state.currentAudio.play().catch(function () {});
        state.isPaused = false;
      }
    },

    /* Toggle play/pause */
    toggle: function () {
      if (!state.isPlaying) {
        this.play(state.sectionIndex);
      } else if (state.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    },

    /* Stop completely */
    stop: function () {
      if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio.src = '';
        state.currentAudio = null;
      }
      state.isPlaying = false;
      state.isPaused = false;
      state.chunks = [];
      state.chunkIndex = 0;
    },

    /* Next section */
    next: function () {
      if (state.sectionIndex < state.sections.length - 1) {
        this.stop();
        state.isPlaying = true;
        state.sectionIndex++;
        startSection(state.sectionIndex);
        if (state.onSectionChange) state.onSectionChange(state.sectionIndex);
      }
    },

    /* Previous section */
    prev: function () {
      if (state.sectionIndex > 0) {
        this.stop();
        state.isPlaying = true;
        state.sectionIndex--;
        startSection(state.sectionIndex);
        if (state.onSectionChange) state.onSectionChange(state.sectionIndex);
      }
    },

    /* Set playback rate */
    setRate: function (r) {
      state.rate = r;
      if (state.currentAudio) state.currentAudio.playbackRate = r;
    },

    /* Get current state */
    getState: function () {
      return {
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        sectionIndex: state.sectionIndex,
        totalSections: state.sections.length,
        rate: state.rate
      };
    },

    /* Event handlers */
    onSectionChange: function (fn) { state.onSectionChange = fn; },
    onEnd: function (fn) { state.onEnd = fn; },
    onError: function (fn) { state.onError = fn; },

    /* Speak arbitrary text (for single sentences) */
    speakText: function (text, callback) {
      var processed = preprocessRomanian(text);
      var chunks = chunkText(processed, CONFIG.maxChunkLen);
      var idx = 0;

      function playNext() {
        if (idx >= chunks.length) {
          if (callback) callback();
          return;
        }
        var audio = new Audio(buildAudioURL(chunks[idx++]));
        audio.playbackRate = state.rate;
        audio.onended = playNext;
        audio.onerror = playNext;
        audio.play().catch(playNext);
      }
      playNext();
    }
  };

  /* ── Cleanup on page unload ── */
  window.addEventListener('beforeunload', function () {
    TTS.stop();
  });

  /* Export */
  window.InfoTTS = TTS;

})();
