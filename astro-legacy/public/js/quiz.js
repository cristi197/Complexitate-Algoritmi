/* ═══════════════════════════════════════════════════════════════
   quiz.js — Motor de quiz interactiv per capitol
   Folosire: <div data-quiz="ID" class="quiz-section"></div>
             window.QUIZ_DATA['ID'] = [{q,opts,ans,exp,diff}, ...]
             diff: 1=Facil, 2=Mediu, 3=Dificil
═══════════════════════════════════════════════════════════════ */
(function () {

/* ── XP System ── */
/* XP is managed centrally by progress.js. Quiz awards XP via window.addXPFromQuiz(). */
var XP_PER_Q  = 10; // XP per correct answer

function updateXPUI() {
  /* Delegate to progress.js which manages the sidebar XP display */
  if (typeof window.refreshProgressUI === 'function') window.refreshProgressUI();
}

/* ── Chapter completion ── */
function markChapterProgress(chapterId, score, total) {
  if (typeof window.addXPFromQuiz === 'function') {
    window.addXPFromQuiz(score * XP_PER_Q, chapterId);
  }
}

var DIFF_LABEL = ['', 'Facil', 'Mediu', 'Dificil'];
var DIFF_CLS   = ['', 'quiz-diff-facil', 'quiz-diff-mediu', 'quiz-diff-dificil'];

function diffBadge(q) {
  if (!q.diff) return '';
  return '<span class="quiz-diff-badge ' + DIFF_CLS[q.diff] + '">' + DIFF_LABEL[q.diff] + '</span>';
}

function renderQuiz(container, questions, chapterId) {
  var total     = questions.length;
  var score     = 0;
  var answered  = new Array(total).fill(null); // chosen option index or -1 = skipped
  var queue     = questions.map(function (_, i) { return i; }); // order of question indices
  var queuePos  = 0; // current position in queue
  var curIdx    = 0;

  function showQ(idx) {
    curIdx = idx;
    var q        = questions[idx];
    var done     = answered[idx] !== null;
    var chosen   = answered[idx];

    var optsHtml = q.opts.map(function (opt, i) {
      var cls = 'quiz-opt';
      if (done) {
        if (i === q.ans)      cls += ' correct';
        else if (i === chosen) cls += ' wrong';
        else                   cls += ' disabled';
      }
      return '<button class="' + cls + '" data-i="' + i + '">' +
        '<span class="quiz-opt-letter">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="quiz-opt-text">' + opt + '</span>' +
        '</button>';
    }).join('');

    var expHtml = '';
    if (done) {
      var ok = chosen === q.ans;
      expHtml =
        '<div class="quiz-exp ' + (ok ? 'quiz-exp-ok' : 'quiz-exp-fail') + '">' +
          (ok
            ? '&#x2705; Corect! '
            : '&#x274C; Greșit. Răspuns corect: <strong>' + q.opts[q.ans] + '</strong>. ') +
          (q.exp || '') +
        '</div>';
    }

    var navHtml = '<div class="quiz-nav">';
    if (idx > 0) {
      navHtml += '<button class="quiz-btn-nav" data-goto="' + (idx - 1) + '">&#8592; Înapoi</button>';
    } else {
      navHtml += '<span></span>';
    }
    // Skip button: only on unanswered questions that are not the last in queue
    if (!done) {
      var remaining = queue.filter(function (qi) { return answered[qi] === null && qi !== idx; });
      if (remaining.length > 0) {
        navHtml += '<button class="quiz-btn-nav quiz-btn-skip" data-action="skip">Sări &#8594;</button>';
      }
    }
    if (done && idx < total - 1) {
      navHtml += '<button class="quiz-btn-nav primary" data-goto="' + (idx + 1) + '">Următoarea &#8594;</button>';
    }
    if (done && idx === total - 1) {
      navHtml += '<button class="quiz-btn-nav primary" data-goto="finish">&#x1F3C6; Vezi scorul</button>';
    }
    // Check if all answered (might be skipped) — show finish only if not already shown
    var allAnswered = answered.every(function (a) { return a !== null; });
    if (allAnswered && done && idx !== total - 1) {
      navHtml += '<button class="quiz-btn-nav primary" data-goto="finish">&#x1F3C6; Vezi scorul</button>';
    }
    navHtml += '</div>';

    container.innerHTML =
      '<div class="quiz-wrap">' +
        '<div class="quiz-header">' +
          '<span class="quiz-lbl">&#x1F3AE; Quiz</span>' +
          '<span class="quiz-prog">Întrebarea ' + (idx + 1) + ' / ' + total + '</span>' +
          '<span class="quiz-sc">&#x2713; ' + score + ' / ' + total + '</span>' +
        '</div>' +
        '<div class="quiz-q">' + diffBadge(q) + q.q + '</div>' +
        '<div class="quiz-opts">' + optsHtml + '</div>' +
        expHtml +
        navHtml +
      '</div>';

    // Bind option clicks (only if not yet answered)
    if (!done) {
      container.querySelectorAll('.quiz-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.dataset.i, 10);
          answered[idx] = i;
          if (i === q.ans) score++;
          showQ(idx);
        });
      });
    }

    // Bind nav and skip
    container.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.dataset.goto;
        if (g === 'finish') showFinish();
        else showQ(parseInt(g, 10));
      });
    });
    container.querySelectorAll('[data-action="skip"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Mark as skipped (-1) so it goes to end
        answered[idx] = -1;
        // Find next unanswered
        var next = queue.find(function (qi) { return answered[qi] === null; });
        if (next !== undefined) showQ(next);
        else showFinish();
      });
    });
  }

  function showFinish() {
    var skipped = answered.filter(function (a) { return a === -1; }).length;
    var attempted = total - skipped;
    var pct   = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    var emoji = pct >= 90 ? '&#x1F3C6;' : pct >= 70 ? '&#x1F389;' : pct >= 50 ? '&#x1F642;' : '&#x1F4DA;';
    var msg   = pct >= 90 ? 'Excelent! Ești pregătit pentru BAC!'
              : pct >= 70 ? 'Bravo! Revizuiește secțiunile cu greșeli.'
              : pct >= 50 ? 'Bine! Recitește teoria și încearcă din nou.'
              :              'Continuă să studiezi — progresul vine cu practica!';

    // Award XP via progress.js
    var xpEarned = score * XP_PER_Q;
    if (chapterId) markChapterProgress(chapterId, score, total);

    var skippedHtml = skipped > 0
      ? '<p style="font-size:13px;opacity:.7;margin-top:4px">(' + skipped + ' întrebări sărite)</p>'
      : '';
    var xpHtml = xpEarned > 0
      ? '<div class="qf-xp">+' + xpEarned + ' XP &#x2605;</div>'
      : '';

    container.innerHTML =
      '<div class="quiz-wrap quiz-finish">' +
        '<div class="qf-emoji">' + emoji + '</div>' +
        '<div class="qf-score">' + score + ' / ' + attempted + '</div>' +
        '<div class="qf-pct">' + pct + '%</div>' +
        xpHtml +
        skippedHtml +
        '<p class="qf-msg">' + msg + '</p>' +
        '<button class="quiz-btn-nav primary qf-retry">&#x1F504; Încearcă din nou</button>' +
      '</div>';

    container.querySelector('.qf-retry').addEventListener('click', function () {
      score     = 0;
      answered  = new Array(total).fill(null);
      queue     = questions.map(function (_, i) { return i; });
      queuePos  = 0;
      showQ(0);
    });
  }

  showQ(0);
}

/* ── Auto-init all [data-quiz] containers ── */
function initAllQuizzes() {
  // Initialize XP display on page load
  updateXPUI();

  document.querySelectorAll('[data-quiz]').forEach(function (el) {
    var id  = el.dataset.quiz;
    var src = el.dataset.quizSrc;
    // Extract chapter ID from quiz ID (e.g. "vectori-quiz" → "vectori")
    var chapterId = id ? id.replace(/-quiz$/, '') : null;

    if (src) {
      // Load questions from external JSON file
      el.innerHTML = '<p style="text-align:center;opacity:.6;padding:2rem">Se încarcă întrebările…</p>';
      fetch(src)
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          var data = Array.isArray(json) ? json : (json.quiz || []);
          // Shuffle and limit if data-quiz-max is set
          var maxQ = el.dataset.quizMax ? parseInt(el.dataset.quizMax, 10) : 0;
          if (maxQ > 0) {
            // Fisher-Yates shuffle then slice
            data = data.slice();
            for (var i = data.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var t = data[i]; data[i] = data[j]; data[j] = t;
            }
            data = data.slice(0, maxQ);
          }
          if (data.length) renderQuiz(el, data, chapterId);
          else el.innerHTML = '<p style="text-align:center;color:#e44">Nu s-au găsit întrebări.</p>';
        })
        .catch(function (err) {
          console.error('Quiz load error:', err);
          // Fall back to inline data if available
          var data = window.QUIZ_DATA && window.QUIZ_DATA[id];
          if (data && data.length) renderQuiz(el, data, chapterId);
        });
    } else {
      // Use inline window.QUIZ_DATA
      var data = window.QUIZ_DATA && window.QUIZ_DATA[id];
      if (data && data.length) renderQuiz(el, data, chapterId);
    }
  });
}

document.addEventListener('DOMContentLoaded', initAllQuizzes);

})();
