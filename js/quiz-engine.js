/* ═══════════════════════════════════════════════════════════════
   quiz-engine.js — Advanced Quiz System with Gamification
   ─────────────────────────────────────────────────────────────
   Features:
   - XP rewards, streaks, combo multipliers
   - Timer mode (optional)
   - Hint system
   - Code execution challenges
   - Progress persistence via InfoDB
   - Adaptive difficulty
   - Leaderboard (local)
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DIFF_LABEL = ['', 'Ușor', 'Mediu', 'Dificil', 'Expert'];
  var DIFF_CLS = ['', 'qe-diff-easy', 'qe-diff-medium', 'qe-diff-hard', 'qe-diff-expert'];
  var DIFF_XP = [0, 5, 10, 20, 35];
  var COMBO_THRESHOLDS = [3, 5, 8, 12]; /* Combo at 3, 5, 8, 12 correct in a row */

  function QuizEngine(container, questions, options) {
    this.container = container;
    this.questions = this.shuffle(questions);
    this.options = Object.assign({
      id: container.dataset.quiz || 'unknown',
      timer: false,
      timerSeconds: 30,
      showHints: true,
      adaptiveDifficulty: false,
      mode: 'standard' /* standard, speedrun, practice */
    }, options || {});

    this.state = {
      current: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      xpEarned: 0,
      answered: new Array(this.questions.length).fill(null),
      hintUsed: new Array(this.questions.length).fill(false),
      times: [],
      startTime: Date.now(),
      questionStart: 0
    };

    this.render();
  }

  QuizEngine.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  QuizEngine.prototype.render = function () {
    this.showQuestion(0);
  };

  QuizEngine.prototype.showQuestion = function (idx) {
    var self = this;
    var q = this.questions[idx];
    var total = this.questions.length;
    var done = this.state.answered[idx] !== null;
    var chosen = this.state.answered[idx];
    this.state.current = idx;
    this.state.questionStart = Date.now();

    var diffBadge = q.diff ? '<span class="qe-badge ' + DIFF_CLS[q.diff] + '">' + DIFF_LABEL[q.diff] + '</span>' : '';

    /* XP and combo display */
    var comboHTML = this.state.combo >= 3 
      ? '<span class="qe-combo">🔥 x' + this.state.combo + '</span>' 
      : '';

    /* Options */
    var optsHTML = q.opts.map(function (opt, i) {
      var cls = 'qe-option';
      if (done) {
        if (i === q.ans) cls += ' correct';
        else if (i === chosen) cls += ' wrong';
        else cls += ' dimmed';
      }
      var letter = String.fromCharCode(65 + i);
      return '<button class="' + cls + '" data-idx="' + i + '" ' + (done ? 'disabled' : '') + '>' +
        '<span class="qe-opt-letter">' + letter + '</span>' +
        '<span class="qe-opt-text">' + opt + '</span>' +
        (done && i === q.ans ? '<span class="qe-opt-check">✓</span>' : '') +
        (done && i === chosen && i !== q.ans ? '<span class="qe-opt-x">✕</span>' : '') +
      '</button>';
    }).join('');

    /* Explanation */
    var expHTML = '';
    if (done) {
      var isCorrect = chosen === q.ans;
      var xpGained = isCorrect ? DIFF_XP[q.diff || 1] : 0;
      expHTML = '<div class="qe-explanation ' + (isCorrect ? 'correct' : 'wrong') + '">' +
        '<div class="qe-exp-header">' +
          (isCorrect 
            ? '<span class="qe-exp-icon">✅</span><span>Corect!' + (xpGained ? ' +' + xpGained + ' XP' : '') + '</span>'
            : '<span class="qe-exp-icon">❌</span><span>Răspuns corect: <strong>' + q.opts[q.ans] + '</strong></span>') +
        '</div>' +
        (q.exp ? '<p class="qe-exp-text">' + q.exp + '</p>' : '') +
      '</div>';
    }

    /* Hint button */
    var hintHTML = '';
    if (this.options.showHints && q.hint && !done && !this.state.hintUsed[idx]) {
      hintHTML = '<button class="qe-hint-btn" id="qe-hint-btn">💡 Indiciu (-2 XP)</button>';
    }
    if (this.state.hintUsed[idx] && q.hint) {
      hintHTML = '<div class="qe-hint-shown">💡 ' + q.hint + '</div>';
    }

    /* Progress dots */
    var dotsHTML = '<div class="qe-dots">';
    for (var d = 0; d < Math.min(total, 20); d++) {
      var dotCls = 'qe-dot';
      if (d === idx) dotCls += ' current';
      else if (this.state.answered[d] !== null) {
        dotCls += this.state.answered[d] === this.questions[d].ans ? ' correct' : ' wrong';
      }
      dotsHTML += '<span class="' + dotCls + '"></span>';
    }
    dotsHTML += '</div>';

    /* Navigation */
    var navHTML = '<div class="qe-nav">';
    if (idx > 0) {
      navHTML += '<button class="qe-nav-btn" data-go="' + (idx - 1) + '">← Înapoi</button>';
    } else {
      navHTML += '<span></span>';
    }
    if (done && idx < total - 1) {
      navHTML += '<button class="qe-nav-btn primary" data-go="' + (idx + 1) + '">Următoarea →</button>';
    } else if (done && idx === total - 1) {
      navHTML += '<button class="qe-nav-btn primary finish" data-go="finish">🏆 Vezi rezultatul</button>';
    } else {
      navHTML += '<span></span>';
    }
    navHTML += '</div>';

    this.container.innerHTML = '' +
      '<div class="qe-container">' +
        '<div class="qe-header">' +
          '<div class="qe-header-left">' +
            '<span class="qe-label">🎮 Quiz</span>' +
            diffBadge +
            comboHTML +
          '</div>' +
          '<div class="qe-header-right">' +
            '<span class="qe-progress-text">' + (idx + 1) + '/' + total + '</span>' +
            '<span class="qe-score">⚡ ' + this.state.xpEarned + ' XP</span>' +
          '</div>' +
        '</div>' +
        dotsHTML +
        '<div class="qe-question">' +
          '<span class="qe-q-number">Q' + (idx + 1) + '</span>' +
          '<p>' + q.q + '</p>' +
        '</div>' +
        (q.code ? '<pre class="qe-code">' + q.code + '</pre>' : '') +
        '<div class="qe-options">' + optsHTML + '</div>' +
        hintHTML +
        expHTML +
        navHTML +
      '</div>';

    /* Bind events */
    this.bindEvents(idx);
  };

  QuizEngine.prototype.bindEvents = function (idx) {
    var self = this;

    /* Option click */
    this.container.querySelectorAll('.qe-option:not([disabled])').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var chosen = parseInt(btn.dataset.idx);
        self.answer(idx, chosen);
      });
    });

    /* Navigation */
    this.container.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.go;
        if (target === 'finish') self.showResults();
        else self.showQuestion(parseInt(target));
      });
    });

    /* Hint */
    var hintBtn = this.container.querySelector('#qe-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        self.state.hintUsed[idx] = true;
        self.state.xpEarned = Math.max(0, self.state.xpEarned - 2);
        self.showQuestion(idx);
      });
    }

    /* Keyboard shortcuts */
    var handler = function (e) {
      if (self.state.answered[idx] !== null) return;
      var key = e.key.toUpperCase();
      var map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[key] !== undefined && map[key] < self.questions[idx].opts.length) {
        self.answer(idx, map[key]);
        document.removeEventListener('keydown', handler);
      }
    };
    document.addEventListener('keydown', handler);
    this._keyHandler = handler;
  };

  QuizEngine.prototype.answer = function (idx, chosen) {
    var q = this.questions[idx];
    this.state.answered[idx] = chosen;

    var timeSpent = (Date.now() - this.state.questionStart) / 1000;
    this.state.times.push(timeSpent);

    if (chosen === q.ans) {
      /* Correct */
      this.state.score++;
      this.state.combo++;
      if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;

      var baseXP = DIFF_XP[q.diff || 1];
      var comboBonus = this.state.combo >= 3 ? Math.floor(this.state.combo * 0.5) : 0;
      var speedBonus = timeSpent < 5 ? 3 : (timeSpent < 10 ? 1 : 0);
      this.state.xpEarned += baseXP + comboBonus + speedBonus;
    } else {
      /* Wrong */
      this.state.combo = 0;
    }

    this.showQuestion(idx);
  };

  QuizEngine.prototype.showResults = function () {
    var total = this.questions.length;
    var score = this.state.score;
    var pct = Math.round((score / total) * 100);
    var totalTime = Math.round((Date.now() - this.state.startTime) / 1000);
    var avgTime = this.state.times.length ? (this.state.times.reduce(function (a, b) { return a + b; }, 0) / this.state.times.length).toFixed(1) : 0;

    /* Save to DB */
    if (window.InfoDB) {
      window.InfoDB.quiz.saveScore(this.options.id, score, total);
      window.InfoDB.profile.addXP(this.state.xpEarned, 'Quiz ' + this.options.id);
    }

    var emoji, msg, grade;
    if (pct === 100) { emoji = '🏆'; msg = 'Perfecțiune! Ești gata pentru BAC!'; grade = 'S'; }
    else if (pct >= 90) { emoji = '🌟'; msg = 'Excelent! Stăpânești subiectul!'; grade = 'A'; }
    else if (pct >= 75) { emoji = '🎉'; msg = 'Foarte bine! Mai revizuiește puțin.'; grade = 'B'; }
    else if (pct >= 60) { emoji = '👍'; msg = 'Bun! Recitește secțiunile cu greșeli.'; grade = 'C'; }
    else if (pct >= 40) { emoji = '📚'; msg = 'Necesită mai multă pregătire.'; grade = 'D'; }
    else { emoji = '💪'; msg = 'Nu renunța! Recitește teoria și încearcă din nou.'; grade = 'F'; }

    /* Stats cards */
    var statsHTML = '' +
      '<div class="qe-stats-grid">' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">' + score + '/' + total + '</div>' +
          '<div class="qe-stat-label">Răspunsuri corecte</div>' +
        '</div>' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">' + pct + '%</div>' +
          '<div class="qe-stat-label">Acuratețe</div>' +
        '</div>' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">+' + this.state.xpEarned + '</div>' +
          '<div class="qe-stat-label">XP câștigat</div>' +
        '</div>' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">' + this.state.maxCombo + 'x</div>' +
          '<div class="qe-stat-label">Combo maxim</div>' +
        '</div>' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">' + this.formatTime(totalTime) + '</div>' +
          '<div class="qe-stat-label">Timp total</div>' +
        '</div>' +
        '<div class="qe-stat-card">' +
          '<div class="qe-stat-value">' + avgTime + 's</div>' +
          '<div class="qe-stat-label">Medie/întrebare</div>' +
        '</div>' +
      '</div>';

    /* Wrong answers review */
    var reviewHTML = '';
    var wrongs = [];
    for (var i = 0; i < this.questions.length; i++) {
      if (this.state.answered[i] !== this.questions[i].ans) wrongs.push(i);
    }
    if (wrongs.length > 0) {
      reviewHTML = '<div class="qe-review"><h4>📝 Întrebări greșite — recapitulare:</h4>';
      var self = this;
      wrongs.forEach(function (wi) {
        var wq = self.questions[wi];
        reviewHTML += '<div class="qe-review-item">' +
          '<p class="qe-review-q"><strong>Q' + (wi + 1) + ':</strong> ' + wq.q + '</p>' +
          '<p class="qe-review-a">✓ Răspuns corect: <strong>' + wq.opts[wq.ans] + '</strong></p>' +
          (wq.exp ? '<p class="qe-review-exp">' + wq.exp + '</p>' : '') +
        '</div>';
      });
      reviewHTML += '</div>';
    }

    var self = this;
    this.container.innerHTML = '' +
      '<div class="qe-container qe-results">' +
        '<div class="qe-results-hero">' +
          '<div class="qe-results-emoji">' + emoji + '</div>' +
          '<div class="qe-results-grade">Nota: ' + grade + '</div>' +
          '<div class="qe-results-score">' + score + ' / ' + total + '</div>' +
          '<p class="qe-results-msg">' + msg + '</p>' +
        '</div>' +
        statsHTML +
        reviewHTML +
        '<div class="qe-results-actions">' +
          '<button class="qe-action-btn primary" id="qe-retry">🔄 Încearcă din nou</button>' +
          '<button class="qe-action-btn" id="qe-review-all">📋 Revizuiește toate</button>' +
        '</div>' +
      '</div>';

    this.container.querySelector('#qe-retry').addEventListener('click', function () {
      self.state = {
        current: 0, score: 0, combo: 0, maxCombo: 0, xpEarned: 0,
        answered: new Array(self.questions.length).fill(null),
        hintUsed: new Array(self.questions.length).fill(false),
        times: [], startTime: Date.now(), questionStart: 0
      };
      self.questions = self.shuffle(self.questions);
      self.showQuestion(0);
    });

    this.container.querySelector('#qe-review-all').addEventListener('click', function () {
      self.showQuestion(0);
    });
  };

  QuizEngine.prototype.formatTime = function (seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m > 0 ? m + 'm ' + s + 's' : s + 's';
  };

  /* ══════════════════════════════════════════════════════════
     AUTO-INITIALIZE
  ══════════════════════════════════════════════════════════ */
  function initAllQuizzes() {
    document.querySelectorAll('[data-quiz]').forEach(function (el) {
      var id = el.dataset.quiz;
      var data = window.QUIZ_DATA && window.QUIZ_DATA[id];
      if (data && data.length) {
        new QuizEngine(el, data, { id: id });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initAllQuizzes);

  /* Export */
  window.QuizEngine = QuizEngine;

})();
