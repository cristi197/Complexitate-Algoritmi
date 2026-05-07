import { useState, useCallback } from 'preact/hooks';

interface Question {
  q: string;
  opts: string[];
  ans: number;
  exp?: string;
  diff?: 1 | 2 | 3;
}

interface Props {
  questions: Question[];
  chapterNum?: number;
}

const DIFF_LABEL = ['', 'Facil', 'Mediu', 'Dificil'];
const DIFF_CLS   = ['', 'quiz-diff-facil', 'quiz-diff-mediu', 'quiz-diff-dificil'];

export default function Quiz({ questions, chapterNum }: Props) {
  const total = questions.length;
  const [curIdx,   setCurIdx]   = useState(0);
  const [answered, setAnswered] = useState<(number | null)[]>(Array(total).fill(null));
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);

  const answer = useCallback((optIdx: number) => {
    if (answered[curIdx] !== null) return;
    const correct = optIdx === questions[curIdx].ans;
    setAnswered(prev => { const n = [...prev]; n[curIdx] = optIdx; return n; });
    if (correct) setScore(s => s + 1);

    // Award XP
    const xpGain = correct ? 10 : 3;
    const curXP  = parseInt(localStorage.getItem('xp') || '0');
    localStorage.setItem('xp', String(curXP + xpGain));
  }, [curIdx, answered, questions]);

  const goTo = useCallback((idx: number) => {
    if (idx === total) { setFinished(true); return; }
    setCurIdx(idx);
  }, [total]);

  const retry = useCallback(() => {
    setCurIdx(0);
    setAnswered(Array(total).fill(null));
    setScore(0);
    setFinished(false);
  }, [total]);

  // Mark chapter done on finish
  const handleFinish = useCallback(() => {
    setFinished(true);
    if (chapterNum !== undefined) {
      localStorage.setItem(`ch_done_${chapterNum}`, '1');
    }
  }, [chapterNum]);

  if (finished) {
    const pct   = Math.round((score / total) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '🙂' : '📚';
    const msg   = pct >= 90 ? 'Excelent! Ești pregătit pentru BAC!'
                : pct >= 70 ? 'Bravo! Revizuiește secțiunile cu greșeli.'
                : pct >= 50 ? 'Bine! Recitește teoria și încearcă din nou.'
                :              'Continuă să studiezi — progresul vine cu practica!';
    return (
      <div class="quiz-wrap quiz-finish">
        <div class="qf-emoji">{emoji}</div>
        <div class="qf-score">{score} / {total}</div>
        <div class="qf-pct">{pct}%</div>
        <p class="qf-msg">{msg}</p>
        <button class="quiz-btn-nav primary qf-retry" onClick={retry}>🔄 Încearcă din nou</button>
      </div>
    );
  }

  const q      = questions[curIdx];
  const done   = answered[curIdx] !== null;
  const chosen = answered[curIdx];

  return (
    <div class="quiz-wrap">
      <div class="quiz-header">
        <span class="quiz-lbl">🎮 Quiz</span>
        <span class="quiz-prog">Întrebarea {curIdx + 1} / {total}</span>
        <span class="quiz-sc">✓ {score} / {total}</span>
      </div>

      <div class="quiz-q">
        {q.diff && (
          <span class={`quiz-diff-badge ${DIFF_CLS[q.diff]}`}>
            {DIFF_LABEL[q.diff]}
          </span>
        )}
        {q.q}
      </div>

      <div class="quiz-opts">
        {q.opts.map((opt, i) => {
          let cls = 'quiz-opt';
          if (done) {
            if (i === q.ans)    cls += ' correct';
            else if (i === chosen) cls += ' wrong';
            else                   cls += ' disabled';
          }
          return (
            <button
              key={i}
              class={cls}
              onClick={() => answer(i)}
              disabled={done}
            >
              <span class="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
              <span class="quiz-opt-text">{opt}</span>
            </button>
          );
        })}
      </div>

      {done && (
        <div class={`quiz-exp ${chosen === q.ans ? 'quiz-exp-ok' : 'quiz-exp-fail'}`}>
          {chosen === q.ans
            ? '✅ Corect! '
            : <>❌ Greșit. Răspuns corect: <strong>{q.opts[q.ans]}</strong>. </>
          }
          {q.exp || ''}
        </div>
      )}

      <div class="quiz-nav">
        {curIdx > 0
          ? <button class="quiz-btn-nav" onClick={() => goTo(curIdx - 1)}>← Înapoi</button>
          : <span />
        }
        {done && curIdx < total - 1 && (
          <button class="quiz-btn-nav primary" onClick={() => goTo(curIdx + 1)}>Următoarea →</button>
        )}
        {done && curIdx === total - 1 && (
          <button class="quiz-btn-nav primary" onClick={handleFinish}>🏆 Vezi scorul</button>
        )}
      </div>
    </div>
  );
}
