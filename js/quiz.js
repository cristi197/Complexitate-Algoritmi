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
  var total     = questions.length;
  var score     = 0;
  var answered  = new Array(total).fill(null); // chosen option index
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
    if (done && idx < total - 1) {
      navHtml += '<button class="quiz-btn-nav primary" data-goto="' + (idx + 1) + '">Următoarea &#8594;</button>';
    }
    if (done && idx === total - 1) {
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

    // Bind nav
    container.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.dataset.goto;
        if (g === 'finish') showFinish();
        else showQ(parseInt(g, 10));
      });
    });
  }

  function showFinish() {
    var pct   = Math.round((score / total) * 100);
    var emoji = pct >= 90 ? '&#x1F3C6;' : pct >= 70 ? '&#x1F389;' : pct >= 50 ? '&#x1F642;' : '&#x1F4DA;';
    var msg   = pct >= 90 ? 'Excelent! Ești pregătit pentru BAC!'
              : pct >= 70 ? 'Bravo! Revizuiește secțiunile cu greșeli.'
              : pct >= 50 ? 'Bine! Recitește teoria și încearcă din nou.'
              :              'Continuă să studiezi — progresul vine cu practica!';

    container.innerHTML =
      '<div class="quiz-wrap quiz-finish">' +
        '<div class="qf-emoji">' + emoji + '</div>' +
        '<div class="qf-score">' + score + ' / ' + total + '</div>' +
        '<div class="qf-pct">' + pct + '%</div>' +
        '<p class="qf-msg">' + msg + '</p>' +
        '<button class="quiz-btn-nav primary qf-retry">&#x1F504; Încearcă din nou</button>' +
      '</div>';

    container.querySelector('.qf-retry').addEventListener('click', function () {
      score     = 0;
      answered  = new Array(total).fill(null);
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
