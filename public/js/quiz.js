/* ═══════════════════════════════════════════════════════════════
   quiz.js — Motor de quiz interactiv per capitol
   Folosire: <div data-quiz="ID" class="quiz-section"></div>
             window.QUIZ_DATA['ID'] = [{q,opts,ans,exp,diff}, ...]
             diff: 1=Facil, 2=Mediu, 3=Dificil
═══════════════════════════════════════════════════════════════ */
(function () {

var DIFF_LABEL = ['', 'Facil', 'Mediu', 'Dificil'];
var DIFF_CLS   = ['', 'quiz-diff-facil', 'quiz-diff-mediu', 'quiz-diff-dificil'];

function diffBadge(q) {
  if (!q.diff) return '';
  return '<span class="quiz-diff-badge ' + DIFF_CLS[q.diff] + '">' + DIFF_LABEL[q.diff] + '</span>';
}

function renderQuiz(container, questions) {
  var total    = questions.length;
  var score    = 0;
  var answered = new Array(total).fill(null); // chosen option index, or null
  var skipped  = new Array(total).fill(false); // true if user pressed skip
  var curIdx   = 0;

  /* ── helpers ─────────────────────────────────────────────── */
  function countAnswered() { return answered.filter(function(a){ return a !== null; }).length; }
  function countSkipped()  { return skipped.filter(Boolean).length; }
  function isDone(i)       { return answered[i] !== null || skipped[i]; }
  function allDone()       { return answered.every(function(a,i){ return a !== null || skipped[i]; }); }

  /* Dot mini-nav at top: ● answered-correct  ● answered-wrong  ○ skipped  · unanswered */
  function dotsHtml() {
    return '<div class="quiz-dots" aria-label="Progres întrebări">' +
      questions.map(function(q, i) {
        var cls = 'quiz-dot';
        if (answered[i] !== null) {
          cls += answered[i] === q.ans ? ' qd-correct' : ' qd-wrong';
        } else if (skipped[i]) {
          cls += ' qd-skipped';
        }
        if (i === curIdx) cls += ' qd-current';
        return '<button class="' + cls + '" data-dot="' + i + '" title="Întrebarea ' + (i+1) + '" aria-label="Întrebarea ' + (i+1) + '"></button>';
      }).join('') +
    '</div>';
  }

  /* Progress stats line */
  function statsHtml() {
    var nAns  = countAnswered();
    var nSkip = countSkipped();
    var nLeft = total - nAns - nSkip;
    return '<div class="quiz-stats">' +
      '<span class="qs-correct">&#x2713; ' + score + ' corecte</span>' +
      '<span class="qs-skipped">&#x23ED; ' + nSkip + ' sărite</span>' +
      '<span class="qs-left">&#x25CB; ' + nLeft + ' rămase</span>' +
    '</div>';
  }

  /* ── main render ─────────────────────────────────────────── */
  function showQ(idx) {
    curIdx = idx;
    var q       = questions[idx];
    var wasAns  = answered[idx] !== null;
    var wasSkip = skipped[idx];
    var chosen  = answered[idx];

    var optsHtml = q.opts.map(function (opt, i) {
      var cls = 'quiz-opt';
      if (wasAns) {
        if (i === q.ans)       cls += ' correct';
        else if (i === chosen) cls += ' wrong';
        else                   cls += ' disabled';
      } else if (wasSkip) {
        cls += ' disabled';
      }
      return '<button class="' + cls + '" data-i="' + i + '">' +
        '<span class="quiz-opt-letter">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="quiz-opt-text">' + opt + '</span>' +
        '</button>';
    }).join('');

    var expHtml = '';
    if (wasAns) {
      var ok = chosen === q.ans;
      expHtml =
        '<div class="quiz-exp ' + (ok ? 'quiz-exp-ok' : 'quiz-exp-fail') + '">' +
          (ok
            ? '&#x2705; Corect! '
            : '&#x274C; Greșit. Răspuns corect: <strong>' + q.opts[q.ans] + '</strong>. ') +
          (q.exp || '') +
        '</div>';
    } else if (wasSkip) {
      expHtml = '<div class="quiz-exp quiz-exp-skip">&#x23ED; Ai sărit această întrebare. Poți reveni oricând.</div>';
    }

    /* Build nav row */
    var navHtml = '<div class="quiz-nav">';

    /* ← Back */
    if (idx > 0) {
      navHtml += '<button class="quiz-btn-nav" data-goto="' + (idx - 1) + '">&#8592; Înapoi</button>';
    } else {
      navHtml += '<span></span>';
    }

    /* Right-side buttons */
    var rightHtml = '';

    if (!wasAns && !wasSkip) {
      /* Unanswered: show Skip + (disabled) Next */
      rightHtml += '<button class="quiz-btn-nav quiz-btn-skip" data-skip="1">&#x23ED; Sari</button>';
    }

    if (wasSkip && !wasAns) {
      /* Was skipped: offer to Answer (just re-enables options) */
      rightHtml += '<button class="quiz-btn-nav quiz-btn-unskip" data-unskip="1">&#x270F; Răspunde</button>';
    }

    var isDoneCur = wasAns || wasSkip;
    if (isDoneCur && idx < total - 1) {
      rightHtml += '<button class="quiz-btn-nav primary" data-goto="' + (idx + 1) + '">Următoarea &#8594;</button>';
    }

    /* Show finish only when all questions are done */
    if (allDone() && idx === total - 1) {
      rightHtml += '<button class="quiz-btn-nav primary" data-goto="finish">&#x1F3C6; Vezi scorul</button>';
    } else if (allDone() && isDoneCur) {
      /* All done but not on last: offer jump to finish */
      rightHtml += '<button class="quiz-btn-nav primary qb-small" data-goto="finish">&#x1F3C6; Scor</button>';
    }

    navHtml += rightHtml + '</div>';

    container.innerHTML =
      '<div class="quiz-wrap">' +
        '<div class="quiz-header">' +
          '<span class="quiz-lbl">&#x1F3AE; Quiz</span>' +
          '<span class="quiz-prog">Întrebarea ' + (idx + 1) + ' / ' + total + '</span>' +
        '</div>' +
        statsHtml() +
        dotsHtml() +
        '<div class="quiz-q">' + diffBadge(q) + q.q + '</div>' +
        '<div class="quiz-opts">' + optsHtml + '</div>' +
        expHtml +
        navHtml +
      '</div>';

    /* Bind option clicks */
    if (!wasAns && !wasSkip) {
      container.querySelectorAll('.quiz-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.dataset.i, 10);
          answered[idx] = i;
          if (i === q.ans) {
            score++;
            var xpGain = 10;
            var curXP  = parseInt(localStorage.getItem('xp') || '0');
            try { localStorage.setItem('xp', String(curXP + xpGain)); } catch(e) {}
          } else {
            var curXP2 = parseInt(localStorage.getItem('xp') || '0');
            try { localStorage.setItem('xp', String(curXP2 + 3)); } catch(e) {}
          }
          showQ(idx);
        });
      });
    }

    /* Bind skip */
    var skipBtn = container.querySelector('[data-skip]');
    if (skipBtn) {
      skipBtn.addEventListener('click', function () {
        skipped[idx] = true;
        showQ(idx);
      });
    }

    /* Bind unskip (go back to answering) */
    var unskipBtn = container.querySelector('[data-unskip]');
    if (unskipBtn) {
      unskipBtn.addEventListener('click', function () {
        skipped[idx] = false;
        showQ(idx);
      });
    }

    /* Bind dot nav */
    container.querySelectorAll('[data-dot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showQ(parseInt(btn.dataset.dot, 10));
      });
    });

    /* Bind nav arrows */
    container.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.dataset.goto;
        if (g === 'finish') showFinish();
        else showQ(parseInt(g, 10));
      });
    });
  }

  /* ── finish screen ───────────────────────────────────────── */
  function showFinish() {
    var nSkip   = countSkipped();
    var nWrong  = countAnswered() - score;
    var pct     = Math.round((score / total) * 100);
    var emoji   = pct >= 90 ? '&#x1F3C6;' : pct >= 70 ? '&#x1F389;' : pct >= 50 ? '&#x1F642;' : '&#x1F4DA;';
    var msg     = pct >= 90 ? 'Excelent! Ești pregătit pentru BAC!'
                : pct >= 70 ? 'Bravo! Revizuiește secțiunile cu greșeli.'
                : pct >= 50 ? 'Bine! Recitește teoria și încearcă din nou.'
                :              'Continuă să studiezi — progresul vine cu practica!';

    var skipNote = nSkip > 0
      ? '<p class="qf-skip-note">&#x23ED; ' + nSkip + ' întreb' + (nSkip === 1 ? 'are sărită' : 'ări sărite') + ' — le poți relua cu &#x1F504;</p>'
      : '';

    container.innerHTML =
      '<div class="quiz-wrap quiz-finish">' +
        '<div class="qf-emoji">' + emoji + '</div>' +
        '<div class="qf-score">' + score + ' / ' + total + '</div>' +
        '<div class="qf-pct">' + pct + '%</div>' +
        '<div class="qf-breakdown">' +
          '<span class="qfb-correct">&#x2705; ' + score + ' corecte</span>' +
          '<span class="qfb-wrong">&#x274C; ' + nWrong + ' greșite</span>' +
          '<span class="qfb-skipped">&#x23ED; ' + nSkip + ' sărite</span>' +
        '</div>' +
        skipNote +
        '<p class="qf-msg">' + msg + '</p>' +
        '<button class="quiz-btn-nav primary qf-retry">&#x1F504; Încearcă din nou</button>' +
      '</div>';

    container.querySelector('.qf-retry').addEventListener('click', function () {
      score    = 0;
      answered = new Array(total).fill(null);
      skipped  = new Array(total).fill(false);
      showQ(0);
    });
  }

  showQ(0);
}

/* ── Auto-init all [data-quiz] containers ── */
function initAllQuizzes() {
  document.querySelectorAll('[data-quiz]').forEach(function (el) {
    var id   = el.dataset.quiz;
    var data = window.QUIZ_DATA && window.QUIZ_DATA[id];
    if (data && data.length) renderQuiz(el, data);
  });
}

document.addEventListener('DOMContentLoaded', initAllQuizzes);

})();
