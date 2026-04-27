/* ═══════════════════════════════════════════════════════════════
   animations.js — shared animations & interactivity
═══════════════════════════════════════════════════════════════ */

/* ── 1. Scroll-reveal for .slide elements ────────────────────── */
function initScrollReveal() {
  const slides = document.querySelectorAll('.slide');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  slides.forEach(s => io.observe(s));
}

/* ── 2. Animated bar chart ───────────────────────────────────── */
function initBarCharts() {
  const bars = document.querySelectorAll('.bar-inner[data-width]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.width = e.target.dataset.width; }, 200);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => io.observe(b));
}

/* ── 3. Tree node staggered reveal ───────────────────────────── */
function initTreeReveal() {
  const trees = document.querySelectorAll('.tree');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const nodes = e.target.querySelectorAll('.tree-node');
        nodes.forEach((n, i) => {
          setTimeout(() => n.classList.add('visible'), i * 120);
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  trees.forEach(t => io.observe(t));
}

/* ── 4. Copy button for code blocks ──────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn'; btn.textContent = 'Copiază';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      const code = pre.innerText.replace('Copiază','').replace('Copiat!','').trim();
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copiat! ✓'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copiază'; btn.classList.remove('copied'); }, 1800);
      });
    });
  });
}

/* ── 5. Active nav highlight on scroll ───────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-bar a[href^="#"]');
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-bar a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ── 6. Bubble Sort animation ────────────────────────────────── */
function initBubbleSortDemo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let values = [64, 34, 25, 12, 22, 11, 90, 45, 78, 55];
  let animating = false;
  let delay = 350;

  function render(highlight = [], sorted = []) {
    const wrap = container.querySelector('.sort-demo');
    if (!wrap) return;
    wrap.innerHTML = '';
    const max = Math.max(...values);
    values.forEach((v, i) => {
      const bar = document.createElement('div');
      bar.className = 'sort-bar';
      bar.style.height = `${Math.round((v / max) * 90)}px`;
      bar.title = v;
      if (sorted.includes(i)) bar.classList.add('sorted');
      else if (highlight.includes(i)) bar.classList.add('comparing');
      wrap.appendChild(bar);
    });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function bubbleSort() {
    animating = true;
    const n = values.length;
    const sortedIdx = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        render([j, j+1], sortedIdx);
        await sleep(delay);
        if (values[j] > values[j+1]) {
          [values[j], values[j+1]] = [values[j+1], values[j]];
          render([j, j+1], sortedIdx);
          await sleep(delay);
        }
      }
      sortedIdx.push(n - 1 - i);
    }
    sortedIdx.push(0);
    render([], sortedIdx);
    animating = false;
  }

  function reset() {
    if (animating) return;
    values = [64, 34, 25, 12, 22, 11, 90, 45, 78, 55];
    render();
  }

  function shuffle() {
    if (animating) return;
    values = Array.from({length: 10}, () => Math.floor(Math.random() * 95) + 5);
    render();
  }

  render();

  container.querySelector('[data-action="start"]')?.addEventListener('click', () => { if (!animating) bubbleSort(); });
  container.querySelector('[data-action="reset"]')?.addEventListener('click', reset);
  container.querySelector('[data-action="shuffle"]')?.addEventListener('click', shuffle);
  const speedSlider = container.querySelector('[data-action="speed"]');
  if (speedSlider) { speedSlider.addEventListener('input', e => { delay = 600 - parseInt(e.target.value); }); }
}

/* ── 7. N-Queens backtracking animation ─────────────────────── */
function initQueensDemo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const N = 4;
  let board = Array(N).fill(-1);
  let animating = false;
  let stepLog = container.querySelector('.anim-status');

  function renderBoard(highlight = {}) {
    const grid = container.querySelector('.bt-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${N}, 36px)`;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement('div');
        cell.className = 'bt-cell';
        const key = `${r},${c}`;
        if (board[r] === c) { cell.classList.add('queen'); cell.textContent = '♛'; }
        else if (highlight[key] === 'try') { cell.classList.add('trying'); }
        else if (highlight[key] === 'fail') { cell.classList.add('fail'); }
        else if (highlight[key] === 'safe') { cell.classList.add('safe'); }
        grid.appendChild(cell);
      }
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  async function solve(row) {
    if (row === N) return true;
    for (let col = 0; col < N; col++) {
      const hl = {};
      hl[`${row},${col}`] = 'try';
      const spd = () => window.animSpeed !== undefined ? window.animSpeed : 420;
      renderBoard(hl); if (stepLog) stepLog.textContent = `Testăm regina pe linia ${row+1}, coloana ${col+1}...`;
      await sleep(spd());
      if (isSafe(row, col)) {
        board[row] = col;
        const hl2 = {}; hl2[`${row},${col}`] = 'safe';
        renderBoard(hl2); if (stepLog) stepLog.textContent = `✅ Sigur! Plasăm regina pe (${row+1},${col+1})`;
        await sleep(spd());
        if (await solve(row + 1)) return true;
        board[row] = -1;
        const hl3 = {}; hl3[`${row},${col}`] = 'fail';
        renderBoard(hl3); if (stepLog) stepLog.textContent = `🔴 Backtrack! Mutăm regina de pe (${row+1},${col+1})`;
        await sleep(spd());
      } else {
        const hl4 = {}; hl4[`${row},${col}`] = 'fail';
        renderBoard(hl4); if (stepLog) stepLog.textContent = `❌ Conflict! (${row+1},${col+1}) nu e sigur`;
        await sleep(spd());
      }
    }
    return false;
  }

  renderBoard();

  container.querySelector('[data-action="start-queens"]')?.addEventListener('click', async () => {
    if (animating) return;
    animating = true; board = Array(N).fill(-1); renderBoard();
    await solve(0);
    if (stepLog) stepLog.textContent = '🎉 Soluție găsită! Toate cele 4 regine sunt plasate în siguranță.';
    animating = false;
  });
  container.querySelector('[data-action="reset-queens"]')?.addEventListener('click', () => {
    if (animating) return;
    board = Array(N).fill(-1); renderBoard();
    if (stepLog) stepLog.textContent = '';
  });
}

/* ── 8. Recursion factorial stack animation ──────────────────── */
function initFactorialDemo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const stackEl = container.querySelector('.call-stack');
  const resultEl = container.querySelector('.fact-result');
  const inputEl = container.querySelector('[data-action="fact-input"]');
  let animating = false;

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function runFactorial() {
    if (animating) return;
    const n = Math.min(parseInt(inputEl?.value || 5), 7);
    animating = true; stackEl.innerHTML = ''; if (resultEl) resultEl.textContent = '';

    const frames = [];
    // Push frames
    for (let i = n; i >= 0; i--) {
      const frame = document.createElement('div');
      frame.style.cssText = `background:var(--blue);color:white;padding:8px 16px;border-radius:7px;font-weight:700;font-size:14px;opacity:0;transform:translateX(-20px);transition:all 0.35s ease;margin-bottom:5px;`;
      frame.textContent = i === 0 ? `factorial(0) → retrage 1` : `factorial(${i}) → apelează factorial(${i-1})`;
      stackEl.appendChild(frame);
      frames.push(frame);
      await sleep(50);
      frame.style.opacity = '1'; frame.style.transform = 'translateX(0)';
      await sleep(window.animSpeed !== undefined ? window.animSpeed : 400);
    }
    await sleep(200);
    // Pop frames with results
    let acc = 1;
    for (let i = frames.length - 1; i >= 0; i--) {
      const val = frames.length - 1 - i;
      acc *= (val === 0 ? 1 : val);
      frames[i].style.background = 'var(--green)';
      frames[i].textContent = `factorial(${val}) = ${acc}`;
      await sleep(window.animSpeed !== undefined ? window.animSpeed : 400);
      frames[i].style.opacity = '0'; frames[i].style.transform = 'translateX(20px)';
      await sleep(200);
      frames[i].remove();
    }
    if (resultEl) { resultEl.textContent = `factorial(${n}) = ${acc}`; resultEl.style.color = 'var(--green)'; }
    animating = false;
  }

  container.querySelector('[data-action="run-factorial"]')?.addEventListener('click', runFactorial);
}

/* ── 9. Page transition on nav links ─────────────────────────── */
function initPageTransitions() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('fade-in');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
  window.addEventListener('pageshow', () => { overlay.classList.remove('fade-in'); });
}

/* ── 10. Init everything on DOMContentLoaded ─────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initBarCharts();
  initTreeReveal();
  initCopyButtons();
  initNavHighlight();
  initPageTransitions();

  // page-specific demos (check by ID)
  if (document.getElementById('bubble-demo'))    initBubbleSortDemo('bubble-demo');
  if (document.getElementById('queens-demo'))    initQueensDemo('queens-demo');
  if (document.getElementById('factorial-demo')) initFactorialDemo('factorial-demo');
  if (document.getElementById('matrix-demo'))    initMatrixZoneDemo('matrix-demo');
  if (document.getElementById('vector-demo'))    initVectorBlockDemo('vector-demo');
});

/* ── 11. Vizualizare zone matrice ────────────────────────────── */
function initMatrixZoneDemo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const N = 5;
  const data = [
    [1,  2,  3,  4,  5],
    [6,  7,  8,  9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25]
  ];

  function render(mode) {
    const vizEl = container.querySelector('.matrix-viz');
    if (!vizEl) return;
    vizEl.innerHTML = '';
    vizEl.style.gridTemplateColumns = `repeat(${N}, 46px)`;

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        const cell = document.createElement('div');
        cell.className = 'mx-cell';
        cell.textContent = data[i-1][j-1];

        const isDiagMain = i === j;
        const isDiagSec  = i + j === N + 1;
        const isUpper    = j > i;
        const isLower    = j < i;
        const isBorder   = i === 1 || i === N || j === 1 || j === N;

        switch (mode) {
          case 'diag-main': if (isDiagMain) cell.classList.add('diag-main'); break;
          case 'diag-sec':  if (isDiagSec)  cell.classList.add('diag-sec');  break;
          case 'both-diag':
            if (isDiagMain && isDiagSec) cell.classList.add('both-diag');
            else if (isDiagMain) cell.classList.add('diag-main');
            else if (isDiagSec)  cell.classList.add('diag-sec');
            break;
          case 'upper':  if (isUpper && !isDiagMain)  cell.classList.add('tri-upper'); break;
          case 'lower':  if (isLower && !isDiagMain)  cell.classList.add('tri-lower'); break;
          case 'border': if (isBorder) cell.classList.add('border-cell'); break;
          case 'all':
            if (isDiagMain && isDiagSec) cell.classList.add('both-diag');
            else if (isDiagMain) cell.classList.add('diag-main');
            else if (isDiagSec)  cell.classList.add('diag-sec');
            else if (isUpper)    cell.classList.add('tri-upper');
            else if (isLower)    cell.classList.add('tri-lower');
            break;
        }
        vizEl.appendChild(cell);
      }
    }
  }

  render('all');

  container.querySelectorAll('[data-zone]').forEach(btn => {
    btn.addEventListener('click', function () {
      container.querySelectorAll('[data-zone]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      render(this.dataset.zone);
    });
  });
}

/* ── 12. Vizualizare vector (inserare / ștergere / căutare) ───── */
function initVectorBlockDemo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let values  = [5, 12, 3, 8, 1, 7, null, null];
  let size    = 6;
  const CAP   = 8;
  const track = container.querySelector('.vec-track');
  const statusEl = container.querySelector('.vec-status');

  function setStatus(html) { if (statusEl) statusEl.innerHTML = html; }

  function render(hl = {}) {
    if (!track) return;
    track.innerHTML = '';
    values.forEach((val, i) => {
      const cell  = document.createElement('div'); cell.className  = 'vec-cell';
      const block = document.createElement('div'); block.className = 'vec-block';
      if (val === null) { block.classList.add('empty'); block.textContent = '—'; }
      else              { block.textContent = val; }
      if (hl.active  === i) block.classList.add('active');
      if (hl.found   === i) block.classList.add('found');
      if (hl.swapped && hl.swapped.includes(i)) block.classList.add('swapped');

      const idx  = document.createElement('div'); idx.className = 'vec-index';
      idx.textContent = `v[${i + 1}]`;
      const addr = document.createElement('div'); addr.className = 'vec-addr';
      addr.textContent = `0x${(0x1000 + i * 4).toString(16).toUpperCase()}`;

      cell.appendChild(block); cell.appendChild(idx); cell.appendChild(addr);
      track.appendChild(cell);
    });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  render();

  /* Inserare */
  container.querySelector('[data-vec="insert"]')?.addEventListener('click', async () => {
    const posEl = container.querySelector('[data-vec="ins-pos"]');
    const valEl = container.querySelector('[data-vec="ins-val"]');
    const pos   = Math.max(1, Math.min(size + 1, parseInt(posEl?.value || 1)));
    const val   = parseInt(valEl?.value ?? 0);
    if (isNaN(val)) { setStatus('<span class="fail">⚠️ Valoare invalidă!</span>'); return; }
    if (size >= CAP) { setStatus('<span class="fail">⚠️ Vector plin!</span>'); return; }

    const idx = pos - 1;
    setStatus(`<span class="info">Inserăm ${val} pe poziția ${pos} — mutăm elementele la dreapta...</span>`);
    for (let i = size - 1; i >= idx; i--) {
      render({ swapped: [i, i + 1] });
      setStatus(`↔ Mutăm v[${i+1}] = ${values[i]} → v[${i+2}]`);
      await sleep(window.animSpeed !== undefined ? window.animSpeed : 350);
      values[i + 1] = values[i];
    }
    values[idx] = val; size++;
    render({ found: idx });
    setStatus(`<span class="ok">✅ Inserat ${val} pe poziția ${pos}. Dimensiune: n = ${size}</span>`);
  });

  /* Ștergere */
  container.querySelector('[data-vec="delete"]')?.addEventListener('click', async () => {
    const posEl = container.querySelector('[data-vec="del-pos"]');
    const pos   = Math.max(1, Math.min(size, parseInt(posEl?.value || 1)));
    if (size === 0) { setStatus('<span class="fail">⚠️ Vectorul este gol!</span>'); return; }

    const idx = pos - 1;
    const deleted = values[idx];
    render({ active: idx });
    setStatus(`🗑 Ștergem v[${pos}] = ${deleted}`);
    await sleep(window.animSpeed !== undefined ? window.animSpeed : 350);

    for (let i = idx; i < size - 1; i++) {
      render({ swapped: [i, i + 1] });
      setStatus(`← Mutăm v[${i+2}] = ${values[i+1]} → v[${i+1}]`);
      await sleep(window.animSpeed !== undefined ? window.animSpeed : 350);
      values[i] = values[i + 1];
    }
    values[size - 1] = null; size--;
    render();
    setStatus(`<span class="ok">✅ Șters ${deleted}. Dimensiune: n = ${size}</span>`);
  });

  /* Căutare */
  container.querySelector('[data-vec="search"]')?.addEventListener('click', async () => {
    const valEl  = container.querySelector('[data-vec="srch-val"]');
    const target = parseInt(valEl?.value ?? 0);
    if (isNaN(target)) { setStatus('<span class="fail">⚠️ Valoare invalidă!</span>'); return; }

    for (let i = 0; i < size; i++) {
      render({ active: i });
      setStatus(`🔍 Comparăm v[${i+1}] = ${values[i]} cu ${target}...`);
      await sleep(window.animSpeed !== undefined ? window.animSpeed : 350);
      if (values[i] === target) {
        render({ found: i });
        setStatus(`<span class="ok">✅ Găsit! ${target} se află pe poziția ${i+1}</span>`);
        return;
      }
    }
    render();
    setStatus(`<span class="fail">❌ ${target} nu există în vector.</span>`);
  });

  /* Reset */
  container.querySelector('[data-vec="reset"]')?.addEventListener('click', () => {
    values = [5, 12, 3, 8, 1, 7, null, null]; size = 6;
    render(); setStatus('');
  });
}
