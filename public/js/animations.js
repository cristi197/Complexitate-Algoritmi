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
  }, { threshold: 0 });
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
    if (pre.querySelector('.copy-btn')) return; /* avoid duplicates */
    const btn = document.createElement('button');
    btn.className = 'copy-btn'; btn.textContent = 'Copiază';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      const clone = pre.cloneNode(true);
      const copyBtn = clone.querySelector('.copy-btn');
      if (copyBtn) copyBtn.remove();
      const code = clone.textContent.trim();
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

  initPageTransitions();

  // page-specific demos (check by ID)
  if (document.getElementById('bubble-demo'))    initBubbleSortDemo('bubble-demo');
  if (document.getElementById('queens-demo'))    initQueensDemo('queens-demo');
  if (document.getElementById('factorial-demo')) initFactorialDemo('factorial-demo');
  if (document.getElementById('matrix-demo'))    initMatrixZoneDemo('matrix-demo');
  if (document.getElementById('vector-demo'))    initVectorBlockDemo('vector-demo');
  if (document.getElementById('sort-viz'))       initSortViz('sort-viz');
  if (document.getElementById('search-viz'))     initSearchViz('search-viz');
  if (document.getElementById('merge-viz'))      initMergeViz('merge-viz');
  if (document.getElementById('sieve-viz'))      initSieveViz('sieve-viz');
  if (document.getElementById('insdel-viz'))     initInsDelViz('insdel-viz');
  if (document.getElementById('freq-viz'))       initFreqViz('freq-viz');
  if (document.getElementById('mtx-diag-viz'))   initMatrixDiagViz('mtx-diag-viz');
  if (document.getElementById('mtx-trans-viz'))  initMatrixTransposeViz('mtx-trans-viz');
  if (document.getElementById('mtx-rot-viz'))    initMatrixRotateViz('mtx-rot-viz');
  if (document.getElementById('mtx-spiral-viz')) initMatrixSpiralViz('mtx-spiral-viz');
  if (document.getElementById('pal-viz'))        initPalindromViz('pal-viz');
  if (document.getElementById('caesar-viz'))     initCaesarViz('caesar-viz');
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

/* ── 9. Scroll Progress Bar ──────────────────────────────────── */
/**
 * Umple bara #scroll-progress pe baza poziției de scroll.
 * Se apelează din platform.js DOMContentLoaded.
 */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
    bar.style.width = pct.toFixed(1) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); /* stare inițială */
}

/* ── 5b. Timp total de citire capitol (actualizează hero badge) ─ */
function initGlobalReadingTime() {
  var el = document.getElementById('reading-time');
  if (!el) return;
  var content = document.querySelector('.wrapper');
  if (!content) return;
  var clone = content.cloneNode(true);
  clone.querySelectorAll('pre, code, table, script, style, svg, iframe, .quiz-section').forEach(function (n) {
    n.parentNode && n.parentNode.removeChild(n);
  });
  var words = (clone.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  var mins  = Math.max(1, Math.round(words / 200));
  el.textContent = mins;
}

/* ── 6. Scroll-based XP for reading sections ─────────────────── */
function initSectionXP() {
  var XP_KEY      = 'infoXP';
  var VISITED_KEY = 'infoVisitedSections';
  var XP_PER_SECTION = 5;

  function getXP() { return parseInt(localStorage.getItem(XP_KEY) || '0', 10); }
  function getVisited() {
    try { return JSON.parse(localStorage.getItem(VISITED_KEY) || '{}'); } catch (e) { return {}; }
  }

  var LEVELS = [0,100,250,500,900,1400,2000,3000,5000];
  var LEVEL_NAMES = ['Începător','Elev','Cunoscător','Avansat','Expert','Master','Campion','Legend','Profesional'];
  function getLevelInfo(xp) {
    var lvl = 0;
    for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i]) lvl = i; }
    var nextXP = LEVELS[lvl+1] || LEVELS[LEVELS.length-1];
    var prevXP = LEVELS[lvl] || 0;
    var pct = Math.min(100, Math.round(((xp - prevXP) / Math.max(1, nextXP - prevXP)) * 100));
    return { level: lvl + 1, name: LEVEL_NAMES[lvl] || 'Profesional', pct: pct };
  }

  function updateSidebarXP(xp) {
    var info = getLevelInfo(xp);
    var valEl  = document.getElementById('xp-value');
    var fillEl = document.getElementById('xp-fill');
    var lvlEl  = document.getElementById('xp-level');
    if (valEl)  valEl.textContent  = xp;
    if (fillEl) fillEl.style.width = info.pct + '%';
    if (lvlEl)  lvlEl.textContent  = 'Nivel ' + info.level + ' — ' + info.name;
  }

  function awardXP(sectionId) {
    var visited = getVisited();
    var pageKey = window.location.pathname + '#' + sectionId;
    if (visited[pageKey]) return; /* already rewarded */
    visited[pageKey] = 1;
    try { localStorage.setItem(VISITED_KEY, JSON.stringify(visited)); } catch (e) {}
    var xp = getXP() + XP_PER_SECTION;
    try { localStorage.setItem(XP_KEY, xp); } catch (e) {}
    updateSidebarXP(xp);

    /* Show a brief +XP toast */
    var toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = '+' + XP_PER_SECTION + ' XP';
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('xp-toast--show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('xp-toast--show');
      setTimeout(function () { toast.parentNode && toast.parentNode.removeChild(toast); }, 400);
    }, 1600);
  }

  /* Observe every section except exercitii */
  var sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.id !== 'exercitii') {
        awardXP(e.target.id);
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(function (s) { io.observe(s); });

  /* Init sidebar display on page load */
  updateSidebarXP(getXP());
}

/* ── 7. Per-section reading time badges ──────────────────────── */
function initSectionReadingTime() {
  var WORDS_PER_MIN = 200;
  document.querySelectorAll('section[id]').forEach(function (sec) {
    var clone = sec.cloneNode(true);
    /* Remove non-readable elements */
    clone.querySelectorAll('pre, code, table, script, style, svg, iframe, .quiz-section').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    var words = (clone.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    if (words < 30) return;
    var mins = Math.max(1, Math.round(words / WORDS_PER_MIN));
    var header = sec.querySelector('.slide-header');
    if (!header) return;
    var badge = document.createElement('span');
    badge.className = 'section-read-time';
    badge.title = 'Timp estimat de citire';
    badge.textContent = '\uD83D\uDCD6 ' + mins + ' min';
    header.appendChild(badge);
  });
}

/* ═══════════════════════════════════════════════════════════════
   PILOT WIDGETS — vectori chapter (Phase 1)
   ─────────────────────────────────────────────────────────────── */

function _vizSleep(){return new Promise(r=>setTimeout(r, window.animSpeed!==undefined?window.animSpeed:350));}
function _vizSetStatus(el,html){if(el)el.innerHTML=html;}

/* ── 13. Sort viz — Bubble / Selection / Insertion ───────────── */
function initSortViz(containerId){
  const C = document.getElementById(containerId);
  if(!C) return;
  const svg     = C.querySelector('.sv-svg');
  const statusE = C.querySelector('.viz-status');
  const cmpE    = C.querySelector('[data-sv="cmp"]');
  const swpE    = C.querySelector('[data-sv="swp"]');
  const algE    = C.querySelector('[data-sv="alg"]');
  const sizeE   = C.querySelector('[data-sv="size"]');
  if(!svg) return;
  let arr=[], busy=false, cmp=0, swp=0;
  const COLORS = { idle:'#cbd5e1', cmp:'#f59e0b', swp:'#ef4444', sorted:'#22c55e', pivot:'#8b5cf6' };

  function rand(n){ arr=[]; for(let i=0;i<n;i++) arr.push(2+Math.floor(Math.random()*28)); cmp=0;swp=0; render(); updateCounters(); }
  function updateCounters(){ if(cmpE)cmpE.textContent=cmp; if(swpE)swpE.textContent=swp; }
  function render(state){
    state = state || {};
    const W = svg.clientWidth || 560, H = 200, n = arr.length;
    const gap = 4, bw = Math.max(8, (W - gap*(n+1))/n);
    svg.setAttribute('viewBox', `0 0 ${W} ${H+24}`);
    let html='';
    const sortedSet = new Set(state.sorted||[]);
    const cmpSet    = new Set(state.cmp||[]);
    const swpSet    = new Set(state.swp||[]);
    const pivot     = state.pivot;
    for(let i=0;i<n;i++){
      const x = gap + i*(bw+gap);
      const h = (arr[i]/30)*H;
      const y = H - h;
      let fill = COLORS.idle;
      if(sortedSet.has(i)) fill = COLORS.sorted;
      if(cmpSet.has(i))    fill = COLORS.cmp;
      if(swpSet.has(i))    fill = COLORS.swp;
      if(pivot===i)        fill = COLORS.pivot;
      html += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="3" fill="${fill}"/>`;
      html += `<text x="${x+bw/2}" y="${y-3}" text-anchor="middle" font-size="11" fill="#475569" font-weight="600">${arr[i]}</text>`;
      html += `<text x="${x+bw/2}" y="${H+16}" text-anchor="middle" font-size="10" fill="#94a3b8">${i+1}</text>`;
    }
    svg.innerHTML = html;
  }

  async function bubble(){
    const n = arr.length;
    for(let i=0;i<n-1;i++){
      for(let j=0;j<n-1-i;j++){
        cmp++; updateCounters();
        render({cmp:[j,j+1], sorted: Array.from({length:i},(_,k)=>n-1-k)});
        _vizSetStatus(statusE, `🟠 Bubble Sort — comparăm v[${j+1}] = ${arr[j]} cu v[${j+2}] = ${arr[j+1]}`);
        await _vizSleep();
        if(arr[j] > arr[j+1]){
          swp++; updateCounters();
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
          render({swp:[j,j+1], sorted: Array.from({length:i},(_,k)=>n-1-k)});
          _vizSetStatus(statusE, `🔴 Interschimbăm: v[${j+1}] ↔ v[${j+2}]`);
          await _vizSleep();
        }
      }
    }
    render({sorted: Array.from({length:n},(_,k)=>k)});
    _vizSetStatus(statusE, `✅ Sortat! ${cmp} comparații · ${swp} interschimbări · complexitate O(n²)`);
  }

  async function selection(){
    const n = arr.length;
    for(let i=0;i<n-1;i++){
      let minIdx=i;
      render({pivot:i, sorted: Array.from({length:i},(_,k)=>k)});
      _vizSetStatus(statusE, `🟣 Selection Sort — căutăm minimul în [v[${i+1}]..v[${n}]]`);
      await _vizSleep();
      for(let j=i+1;j<n;j++){
        cmp++; updateCounters();
        render({pivot:minIdx, cmp:[j], sorted: Array.from({length:i},(_,k)=>k)});
        _vizSetStatus(statusE, `Comparăm v[${j+1}] = ${arr[j]} cu min curent v[${minIdx+1}] = ${arr[minIdx]}`);
        await _vizSleep();
        if(arr[j] < arr[minIdx]) minIdx = j;
      }
      if(minIdx !== i){
        swp++; updateCounters();
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        render({swp:[i,minIdx], sorted: Array.from({length:i},(_,k)=>k)});
        _vizSetStatus(statusE, `🔴 Plasăm minimul pe poziția ${i+1}`);
        await _vizSleep();
      }
    }
    render({sorted: Array.from({length:n},(_,k)=>k)});
    _vizSetStatus(statusE, `✅ Sortat! ${cmp} comparații · ${swp} interschimbări · O(n²)`);
  }

  async function insertion(){
    const n = arr.length;
    for(let i=1;i<n;i++){
      const key = arr[i];
      let j = i-1;
      render({cmp:[i], sorted: Array.from({length:i},(_,k)=>k)});
      _vizSetStatus(statusE, `🟢 Insertion Sort — luăm cheia v[${i+1}] = ${key} și o inserăm în [v[1]..v[${i}]]`);
      await _vizSleep();
      while(j>=0 && arr[j]>key){
        cmp++; updateCounters();
        arr[j+1] = arr[j];
        swp++; updateCounters();
        render({swp:[j,j+1], sorted: Array.from({length:i+1},(_,k)=>k).filter(k=>k!==j+1)});
        _vizSetStatus(statusE, `↪ Mutăm v[${j+1}] = ${arr[j]} → v[${j+2}]`);
        await _vizSleep();
        j--;
      }
      if(j>=0){ cmp++; updateCounters(); }
      arr[j+1] = key;
      render({sorted: Array.from({length:i+1},(_,k)=>k)});
      await _vizSleep();
    }
    render({sorted: Array.from({length:n},(_,k)=>k)});
    _vizSetStatus(statusE, `✅ Sortat! ${cmp} comparații · ${swp} mutări · O(n²) worst / O(n) best`);
  }

  C.querySelector('[data-sv="start"]')?.addEventListener('click', async () => {
    if(busy) return; busy=true; cmp=0; swp=0; updateCounters();
    const alg = algE?.value || 'bubble';
    try{
      if(alg==='bubble') await bubble();
      else if(alg==='selection') await selection();
      else await insertion();
    } finally { busy=false; }
  });
  C.querySelector('[data-sv="shuffle"]')?.addEventListener('click', () => {
    if(busy) return;
    const n = Math.max(4, Math.min(16, parseInt(sizeE?.value||10)));
    rand(n);
    _vizSetStatus(statusE, `🎲 Generat un vector aleator cu ${n} elemente. Apasă <strong>Start</strong>.`);
  });
  C.querySelector('[data-sv="reverse"]')?.addEventListener('click', () => {
    if(busy) return;
    const n = Math.max(4, Math.min(16, parseInt(sizeE?.value||10)));
    arr = Array.from({length:n},(_,i)=>30-i*2);
    cmp=0; swp=0; updateCounters(); render();
    _vizSetStatus(statusE, `📉 Vector invers sortat (cel mai rău caz pentru Bubble/Insertion).`);
  });

  rand(10);
}

/* ── 14. Search viz — Linear vs Binary ───────────────────────── */
function initSearchViz(containerId){
  const C = document.getElementById(containerId);
  if(!C) return;
  const svg = C.querySelector('.sv-svg');
  const statusE = C.querySelector('.viz-status');
  const modeE = C.querySelector('[data-srv="mode"]');
  const targetE = C.querySelector('[data-srv="target"]');
  const stepE = C.querySelector('[data-srv="steps"]');
  if(!svg) return;
  let arr=[], busy=false, steps=0;
  const COL = { idle:'#e2e8f0', range:'#dbeafe', mij:'#f59e0b', cur:'#f59e0b', found:'#22c55e', out:'#cbd5e1' };

  function gen(){ arr=[]; let v=1+Math.floor(Math.random()*3);
    for(let i=0;i<12;i++){ arr.push(v); v += 1+Math.floor(Math.random()*5); }
    steps=0; if(stepE)stepE.textContent=0; render(); }
  function render(state){
    state = state || {};
    const W = svg.clientWidth || 560, H = 90, n = arr.length;
    const gap=6, bw=Math.max(28, (W - gap*(n+1))/n);
    svg.setAttribute('viewBox', `0 0 ${W} ${H+40}`);
    let html='';
    for(let i=0;i<n;i++){
      const x=gap+i*(bw+gap), y=10;
      let fill=COL.idle;
      if(state.range && (i<state.range[0]||i>state.range[1])) fill=COL.out;
      else if(state.range) fill=COL.range;
      if(state.cur===i) fill=COL.cur;
      if(state.mij===i) fill=COL.mij;
      if(state.found===i) fill=COL.found;
      html += `<rect x="${x}" y="${y}" width="${bw}" height="40" rx="6" fill="${fill}" stroke="#94a3b8" stroke-width="1"/>`;
      html += `<text x="${x+bw/2}" y="${y+26}" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">${arr[i]}</text>`;
      html += `<text x="${x+bw/2}" y="${y+58}" text-anchor="middle" font-size="10" fill="#64748b">v[${i+1}]</text>`;
      if(state.mij===i){
        html += `<text x="${x+bw/2}" y="${y+74}" text-anchor="middle" font-size="11" fill="#ea580c" font-weight="700">↑ mij</text>`;
      } else if(state.range && state.range[0]===i){
        html += `<text x="${x+bw/2}" y="${y+74}" text-anchor="middle" font-size="11" fill="#0284c7" font-weight="700">↑ st</text>`;
      } else if(state.range && state.range[1]===i){
        html += `<text x="${x+bw/2}" y="${y+74}" text-anchor="middle" font-size="11" fill="#0284c7" font-weight="700">↑ dr</text>`;
      }
    }
    svg.innerHTML = html;
  }

  async function linear(target){
    const n = arr.length;
    for(let i=0;i<n;i++){
      steps++; if(stepE)stepE.textContent=steps;
      render({cur:i});
      _vizSetStatus(statusE, `🔎 Pasul ${steps}: comparăm v[${i+1}] = ${arr[i]} cu ${target}`);
      await _vizSleep();
      if(arr[i]===target){
        render({found:i});
        _vizSetStatus(statusE, `<span class="ok">✅ Găsit ${target} la poziția ${i+1} în ${steps} pași. (Linear = O(n))</span>`);
        return;
      }
    }
    render();
    _vizSetStatus(statusE, `<span class="fail">❌ ${target} nu există. Linear: ${steps} comparații.</span>`);
  }
  async function binary(target){
    let st=0, dr=arr.length-1;
    while(st<=dr){
      const mij = (st+dr)>>1;
      steps++; if(stepE)stepE.textContent=steps;
      render({range:[st,dr], mij});
      _vizSetStatus(statusE, `🎯 Pasul ${steps}: st=${st+1}, dr=${dr+1}, mij=${mij+1} → v[mij]=${arr[mij]} vs ${target}`);
      await _vizSleep();
      if(arr[mij]===target){
        render({found:mij});
        _vizSetStatus(statusE, `<span class="ok">✅ Găsit ${target} la poziția ${mij+1} în ${steps} pași. (Binary = O(log n))</span>`);
        return;
      }
      if(arr[mij]<target){ st=mij+1; _vizSetStatus(statusE, `${arr[mij]} &lt; ${target} → căutăm la dreapta: st = mij+1`); }
      else                { dr=mij-1; _vizSetStatus(statusE, `${arr[mij]} &gt; ${target} → căutăm la stânga: dr = mij-1`); }
      await _vizSleep();
    }
    render();
    _vizSetStatus(statusE, `<span class="fail">❌ ${target} nu există în vector. Binary: ${steps} pași.</span>`);
  }

  C.querySelector('[data-srv="go"]')?.addEventListener('click', async () => {
    if(busy) return; busy=true; steps=0; if(stepE)stepE.textContent=0;
    const t = parseInt(targetE?.value||0);
    if(isNaN(t)){ _vizSetStatus(statusE,'⚠️ Introdu o valoare validă'); busy=false; return; }
    try{ if(modeE?.value==='binary') await binary(t); else await linear(t); }
    finally{ busy=false; }
  });
  C.querySelector('[data-srv="regen"]')?.addEventListener('click', () => { if(busy) return; gen(); _vizSetStatus(statusE,'🔄 Vector nou (sortat) — alege o țintă și Start.'); });
  gen();
  _vizSetStatus(statusE, 'Setează ținta, alege Linear/Binary și apasă Start. Vectorul este deja sortat.');
}

/* ── 15. Merge viz — interclasare doi vectori sortați ────────── */
function initMergeViz(containerId){
  const C = document.getElementById(containerId);
  if(!C) return;
  const svg = C.querySelector('.sv-svg');
  const statusE = C.querySelector('.viz-status');
  if(!svg) return;
  let A=[1,3,5,7,9], B=[2,4,6,8], OUT=[], busy=false;
  const aE = C.querySelector('[data-mv="a"]');
  const bE = C.querySelector('[data-mv="b"]');
  if(aE) aE.value = A.join(',');
  if(bE) bE.value = B.join(',');

  function render(state){
    state = state || {};
    const W = svg.clientWidth || 600, n = Math.max(A.length, B.length, OUT.length||A.length+B.length);
    const bw = 36, gap = 8;
    const totalW = Math.max(W, n*(bw+gap)+gap);
    const rowH = 50, padX = 60;
    svg.setAttribute('viewBox', `0 0 ${totalW} ${rowH*3+50}`);
    let html='';
    // labels
    html += `<text x="6" y="${rowH*0+30}" font-size="13" font-weight="700" fill="#7c3aed">A:</text>`;
    html += `<text x="6" y="${rowH*1+30}" font-size="13" font-weight="700" fill="#0284c7">B:</text>`;
    html += `<text x="6" y="${rowH*2+30}" font-size="13" font-weight="700" fill="#16a34a">C:</text>`;
    function drawRow(arr, y, ptr, color, taken){
      for(let i=0;i<arr.length;i++){
        const x = padX + i*(bw+gap);
        const isTaken = taken && taken.has(i);
        const isPtr = ptr===i;
        const fill = isTaken ? '#e2e8f0' : (isPtr ? color : '#fff');
        const text = isTaken ? '✓' : arr[i];
        html += `<rect x="${x}" y="${y+6}" width="${bw}" height="32" rx="5" fill="${fill}" stroke="${isPtr?color:'#94a3b8'}" stroke-width="${isPtr?2:1}"/>`;
        html += `<text x="${x+bw/2}" y="${y+28}" text-anchor="middle" font-size="14" font-weight="700" fill="${isTaken?'#94a3b8':'#0f172a'}">${text}</text>`;
        if(isPtr){
          html += `<text x="${x+bw/2}" y="${y+52}" text-anchor="middle" font-size="11" fill="${color}" font-weight="700">↑${ptr===state.aPtr?'i':(ptr===state.bPtr?'j':'k')}</text>`;
        }
      }
    }
    drawRow(A, rowH*0, state.aPtr, '#7c3aed', state.aTaken);
    drawRow(B, rowH*1, state.bPtr, '#0284c7', state.bTaken);
    // output row
    for(let i=0;i<A.length+B.length;i++){
      const x = padX + i*(bw+gap);
      const v = OUT[i];
      const isPtr = state.kPtr===i;
      const fill = v!==undefined ? '#dcfce7' : '#fff';
      html += `<rect x="${x}" y="${rowH*2+6}" width="${bw}" height="32" rx="5" fill="${fill}" stroke="${isPtr?'#16a34a':'#cbd5e1'}" stroke-width="${isPtr?2:1}" stroke-dasharray="${v===undefined?'4 3':''}"/>`;
      html += `<text x="${x+bw/2}" y="${rowH*2+28}" text-anchor="middle" font-size="14" font-weight="700" fill="${v!==undefined?'#15803d':'#94a3b8'}">${v!==undefined?v:''}</text>`;
    }
    svg.innerHTML = html;
  }

  async function go(){
    OUT=[]; render();
    const m=A.length, n=B.length; let i=0,j=0,k=0;
    const aT=new Set(), bT=new Set();
    while(i<m && j<n){
      render({aPtr:i, bPtr:j, kPtr:k, aTaken:aT, bTaken:bT});
      _vizSetStatus(statusE, `Comparăm A[${i+1}] = ${A[i]} cu B[${j+1}] = ${B[j]} → alegem ${A[i]<=B[j]?'A':'B'}`);
      await _vizSleep();
      if(A[i] <= B[j]){ OUT[k++] = A[i]; aT.add(i); i++; }
      else            { OUT[k++] = B[j]; bT.add(j); j++; }
    }
    while(i<m){ render({aPtr:i, kPtr:k, aTaken:aT, bTaken:bT}); _vizSetStatus(statusE,`Restul din A → C[${k+1}]`); await _vizSleep(); OUT[k++]=A[i]; aT.add(i); i++; }
    while(j<n){ render({bPtr:j, kPtr:k, aTaken:aT, bTaken:bT}); _vizSetStatus(statusE,`Restul din B → C[${k+1}]`); await _vizSleep(); OUT[k++]=B[j]; bT.add(j); j++; }
    render({aTaken:aT, bTaken:bT});
    _vizSetStatus(statusE, `<span class="ok">✅ Interclasat în ${m+n} pași — C = [${OUT.join(', ')}]. Complexitate: O(m+n).</span>`);
  }

  function parseInput(){
    const aTxt = aE?.value || ''; const bTxt = bE?.value || '';
    const parse = s => s.split(/[,\s]+/).filter(Boolean).map(Number).filter(v=>!isNaN(v));
    const a = parse(aTxt), b = parse(bTxt);
    a.sort((x,y)=>x-y); b.sort((x,y)=>x-y);
    return [a,b];
  }

  C.querySelector('[data-mv="go"]')?.addEventListener('click', async () => {
    if(busy) return;
    const [a,b] = parseInput();
    if(!a.length || !b.length){ _vizSetStatus(statusE,'⚠️ Introdu cel puțin 1 număr în fiecare vector'); return; }
    A=a; B=b; OUT=[]; busy=true;
    try{ await go(); } finally{ busy=false; }
  });
  C.querySelector('[data-mv="reset"]')?.addEventListener('click', () => {
    if(busy) return;
    A=[1,3,5,7,9]; B=[2,4,6,8]; OUT=[];
    if(aE) aE.value = A.join(',');
    if(bE) bE.value = B.join(',');
    render(); _vizSetStatus(statusE,'Apasă <strong>Start</strong> pentru a interclasa cei doi vectori sortați.');
  });
  render();
  _vizSetStatus(statusE, 'Apasă <strong>Start</strong> pentru a interclasa cei doi vectori sortați. Vectorii se sortează automat.');
}

/* ── 16. Sieve viz — Ciurul lui Eratostene ───────────────────── */
function initSieveViz(containerId){
  const C = document.getElementById(containerId);
  if(!C) return;
  const grid = C.querySelector('.sieve-grid');
  const statusE = C.querySelector('.viz-status');
  const nE = C.querySelector('[data-sv2="n"]');
  const cntE = C.querySelector('[data-sv2="cnt"]');
  if(!grid) return;
  let busy=false, N=60;

  function render(state){
    state = state || {};
    const composite = state.composite || new Set();
    const prime = state.prime || new Set();
    const cur = state.cur, mult = state.mult;
    let html='';
    for(let i=2;i<=N;i++){
      let cls='sieve-cell';
      if(i===cur) cls += ' sieve-cur';
      else if(mult && mult.has(i)) cls += ' sieve-mult';
      else if(prime.has(i)) cls += ' sieve-prime';
      else if(composite.has(i)) cls += ' sieve-composite';
      html += `<div class="${cls}">${i}</div>`;
    }
    grid.innerHTML = html;
  }

  async function run(){
    const composite=new Set(), prime=new Set();
    render({composite, prime});
    _vizSetStatus(statusE, `🌱 Începem ciurul pentru N = ${N}. Pornim de la 2.`);
    await _vizSleep();
    for(let i=2;i*i<=N;i++){
      if(composite.has(i)) continue;
      prime.add(i);
      render({composite, prime, cur:i});
      _vizSetStatus(statusE, `🟢 ${i} este <strong>prim</strong>. Marcăm multiplii lui ${i} pornind de la ${i}² = ${i*i}.`);
      await _vizSleep();
      const mult = new Set();
      for(let j=i*i;j<=N;j+=i){ composite.add(j); mult.add(j); }
      render({composite, prime, cur:i, mult});
      await _vizSleep();
    }
    for(let i=2;i<=N;i++) if(!composite.has(i)) prime.add(i);
    render({composite, prime});
    if(cntE) cntE.textContent = prime.size;
    _vizSetStatus(statusE, `<span class="ok">✅ Gata! ${prime.size} numere prime ≤ ${N}: ${[...prime].join(', ')}</span>`);
  }

  C.querySelector('[data-sv2="go"]')?.addEventListener('click', async () => {
    if(busy) return;
    N = Math.max(10, Math.min(120, parseInt(nE?.value||60)));
    busy=true;
    try{ await run(); } finally { busy=false; }
  });
  C.querySelector('[data-sv2="reset"]')?.addEventListener('click', () => {
    if(busy) return;
    if(cntE) cntE.textContent='—';
    render(); _vizSetStatus(statusE,'Apasă <strong>Start</strong> pentru a porni ciurul.');
  });

  render();
  _vizSetStatus(statusE, 'Apasă <strong>Start</strong> pentru a vedea Ciurul lui Eratostene pas cu pas.');
}

/* ── 16. Insert / Delete step viz ────────────────────────────── */
function initInsDelViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const trackE  = C.querySelector('.vec-track');
  const statusE = C.querySelector('.viz-status');
  if (!trackE) return;

  const CAP = 8;
  const INITIAL = [3, 7, 1, 9, 4, 2, null, null];
  let values = INITIAL.slice();
  let size   = 6;
  let busy   = false;

  function render(hl = {}) {
    trackE.innerHTML = '';
    values.forEach((val, i) => {
      const cell  = document.createElement('div'); cell.className = 'vec-cell';
      const block = document.createElement('div'); block.className = 'vec-block';
      if (val === null) { block.classList.add('empty'); block.textContent = '—'; }
      else              { block.textContent = val; }
      if (hl.active  === i) block.classList.add('active');
      if (hl.found   === i) block.classList.add('found');
      if (hl.removing=== i) block.classList.add('removing');
      if (hl.swapped && hl.swapped.includes(i)) block.classList.add('swapped');
      const idx = document.createElement('div'); idx.className = 'vec-index';
      idx.textContent = `v[${i + 1}]`;
      cell.appendChild(block); cell.appendChild(idx);
      trackE.appendChild(cell);
    });
  }

  C.querySelector('[data-id="insert"]')?.addEventListener('click', async () => {
    if (busy) return;
    const pos = Math.max(1, Math.min(size + 1, parseInt(C.querySelector('[data-id="pos"]')?.value || 1)));
    const val = parseInt(C.querySelector('[data-id="val"]')?.value || 0);
    if (size >= CAP) { _vizSetStatus(statusE,'<span class="fail">⚠️ Vector plin!</span>'); return; }
    busy = true;
    const idx = pos - 1;
    _vizSetStatus(statusE, `<span class="info">Inserăm <strong>${val}</strong> pe poziția ${pos}. Trebuie să mutăm ${size - idx} element(e) la dreapta.</span>`);
    await _vizSleep(600);
    for (let i = size - 1; i >= idx; i--) {
      render({ swapped: [i, i + 1] });
      _vizSetStatus(statusE, `↔ v[${i+1}] = ${values[i]} → v[${i+2}]`);
      await _vizSleep();
      values[i + 1] = values[i];
    }
    values[idx] = val; size++;
    render({ found: idx });
    _vizSetStatus(statusE, `<span class="ok">✅ Inserat ${val}. n = ${size}. Cost: <strong>${size - idx} deplasări</strong> ⇒ O(n).</span>`);
    busy = false;
  });

  C.querySelector('[data-id="delete"]')?.addEventListener('click', async () => {
    if (busy) return;
    const pos = Math.max(1, Math.min(size, parseInt(C.querySelector('[data-id="pos"]')?.value || 1)));
    if (size === 0) { _vizSetStatus(statusE,'<span class="fail">⚠️ Vector gol!</span>'); return; }
    busy = true;
    const idx = pos - 1;
    const removed = values[idx];
    render({ removing: idx });
    _vizSetStatus(statusE, `🗑 Ștergem v[${pos}] = <strong>${removed}</strong>. Mutăm ${size - 1 - idx} element(e) la stânga.`);
    await _vizSleep(600);
    for (let i = idx; i < size - 1; i++) {
      render({ swapped: [i, i + 1] });
      _vizSetStatus(statusE, `← v[${i+2}] = ${values[i+1]} → v[${i+1}]`);
      await _vizSleep();
      values[i] = values[i + 1];
    }
    values[size - 1] = null; size--;
    render();
    _vizSetStatus(statusE, `<span class="ok">✅ Șters ${removed}. n = ${size}. Cost: <strong>${size - idx} deplasări</strong> ⇒ O(n).</span>`);
    busy = false;
  });

  C.querySelector('[data-id="reset"]')?.addEventListener('click', () => {
    if (busy) return;
    values = INITIAL.slice(); size = 6;
    render(); _vizSetStatus(statusE,'Vector resetat la starea inițială.');
  });

  render();
  _vizSetStatus(statusE,'Alege o poziție și apasă <strong>Inserează</strong> sau <strong>Șterge</strong>.');
}

/* ── 17. Frequency / Counting Sort viz ───────────────────────── */
function initFreqViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const srcE    = C.querySelector('.freq-source');
  const gridE   = C.querySelector('.freq-grid');
  const outE    = C.querySelector('.freq-output');
  const statusE = C.querySelector('.viz-status');
  const inputE  = C.querySelector('[data-fv="input"]');
  const goE     = C.querySelector('[data-fv="go"]');
  const resetE  = C.querySelector('[data-fv="reset"]');
  if (!srcE || !gridE || !outE) return;

  let busy = false;
  let arr  = [];
  let freq = [];
  let MAX  = 0;

  function parse() {
    const raw = (inputE?.value || '').split(/[,\s]+/).map(s => parseInt(s)).filter(n => !isNaN(n) && n >= 0 && n <= 9);
    return raw.slice(0, 16);
  }

  function renderSource(curIdx = -1, doneUpTo = -1) {
    srcE.innerHTML = '';
    arr.forEach((v, i) => {
      const el = document.createElement('div'); el.className = 'fs-item';
      el.textContent = v;
      if (i === curIdx) el.classList.add('cur');
      else if (i <= doneUpTo) el.classList.add('done');
      srcE.appendChild(el);
    });
  }
  function renderFreq(hl = {}) {
    gridE.innerHTML = '';
    for (let i = 0; i <= MAX; i++) {
      const cell = document.createElement('div'); cell.className = 'freq-cell';
      if (hl.cur === i) cell.classList.add('cur');
      if (hl.inc === i) cell.classList.add('inc');
      if (hl.emit === i) cell.classList.add('emit');
      const v = document.createElement('div'); v.className = 'fc-val'; v.textContent = freq[i] || 0;
      const idx = document.createElement('div'); idx.className = 'fc-idx'; idx.textContent = `f[${i}]`;
      cell.appendChild(v); cell.appendChild(idx);
      gridE.appendChild(cell);
    }
  }

  async function run() {
    if (busy) return;
    arr = parse();
    if (!arr.length) { _vizSetStatus(statusE,'<span class="fail">⚠️ Introdu valori 0..9 separate prin spațiu/virgulă.</span>'); return; }
    busy = true;
    MAX  = Math.max(...arr);
    freq = new Array(MAX + 1).fill(0);
    outE.innerHTML = '';
    renderSource(-1, -1);
    renderFreq();
    _vizSetStatus(statusE,'<span class="info">Pasul 1: numărăm aparițiile fiecărei valori.</span>');
    await _vizSleep(700);

    // Phase 1: count
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      renderSource(i, i - 1);
      renderFreq({ cur: v });
      _vizSetStatus(statusE, `Citim v[${i+1}] = ${v} → incrementăm <code>freq[${v}]</code>`);
      await _vizSleep();
      freq[v]++;
      renderFreq({ inc: v });
      await _vizSleep(Math.max(120, (window.animSpeed ?? 350) * 0.4));
    }
    renderSource(-1, arr.length - 1);
    renderFreq();
    _vizSetStatus(statusE,'<span class="info">Pasul 2: reconstruim vectorul sortat parcurgând freq[] de la 0 la MAX.</span>');
    await _vizSleep(800);

    // Phase 2: reconstruct sorted output
    const out = [];
    for (let val = 0; val <= MAX; val++) {
      if (!freq[val]) continue;
      for (let k = 0; k < freq[val]; k++) {
        renderFreq({ emit: val });
        out.push(val);
        outE.innerHTML = `<strong>${out.join(' ')}</strong>`;
        _vizSetStatus(statusE, `Emitem ${val} (de ${k+1}/${freq[val]} ori)`);
        await _vizSleep(Math.max(120, (window.animSpeed ?? 350) * 0.5));
      }
    }
    _vizSetStatus(statusE, `<span class="ok">✅ Sortat în O(n + K) = O(${arr.length} + ${MAX + 1}). Total elemente: ${out.length}.</span>`);
    busy = false;
  }

  function reset() {
    if (busy) return;
    arr = []; freq = []; MAX = 0;
    srcE.innerHTML = ''; gridE.innerHTML = ''; outE.innerHTML = '';
    _vizSetStatus(statusE,'Apasă <strong>Start</strong>.');
  }

  goE?.addEventListener('click', run);
  resetE?.addEventListener('click', reset);
  reset();
}

/* ── 18. Matrix helpers (shared by diag/transpose/rotate/spiral) */
function _mtxRender(gridEl, mat, hl = {}) {
  const n = mat.length;
  gridEl.style.setProperty('--n', n);
  gridEl.innerHTML = '';
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const c = document.createElement('div');
      c.className = 'mtx-cell';
      c.textContent = mat[i][j] === null || mat[i][j] === undefined ? '' : mat[i][j];
      const key = `${i},${j}`;
      if (hl.classes && hl.classes[key]) c.classList.add(...hl.classes[key].split(' '));
      gridEl.appendChild(c);
    }
  }
}
function _mtxRandom(n, lo = 1, hi = 9) {
  const m = [];
  for (let i = 0; i < n; i++) { const r = []; for (let j = 0; j < n; j++) r.push(lo + Math.floor(Math.random() * (hi - lo + 1))); m.push(r); }
  return m;
}

/* ── 19. Diagonals & zones viz ───────────────────────────────── */
function initMatrixDiagViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const gridE  = C.querySelector('.mtx-grid');
  const statusE = C.querySelector('.viz-status');
  const sumE   = C.querySelector('[data-md="sum"]');
  if (!gridE) return;

  let N = 5;
  let mat = _mtxRandom(N);

  function highlight(mode) {
    const cls = {};
    let sum = 0, count = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      let hit = false;
      if (mode === 'principala' && i === j)             { cls[`${i},${j}`] = 'diag-p'; hit = true; }
      if (mode === 'secundara'  && i + j === N - 1)     { cls[`${i},${j}`] = 'diag-s'; hit = true; }
      if (mode === 'tri-sup'    && j > i)               { cls[`${i},${j}`] = 'tri-sup'; hit = true; }
      if (mode === 'tri-inf'    && j < i)               { cls[`${i},${j}`] = 'tri-inf'; hit = true; }
      if (mode === 'bord'       && (i === 0 || i === N - 1 || j === 0 || j === N - 1)) { cls[`${i},${j}`] = 'bord'; hit = true; }
      if (mode === 'interior'   && (i > 0 && i < N - 1 && j > 0 && j < N - 1))         { cls[`${i},${j}`] = 'done'; hit = true; }
      if (hit) { sum += mat[i][j]; count++; }
    }
    _mtxRender(gridE, mat, { classes: cls });
    if (sumE) sumE.textContent = sum;
    const labels = { principala:'diagonala principală (i==j)', secundara:'diagonala secundară (i+j==n-1)', 'tri-sup':'triunghiul superior (j>i)', 'tri-inf':'triunghiul inferior (j<i)', bord:'bordura (i=0 sau i=n-1 sau j=0 sau j=n-1)', interior:'interiorul matricei' };
    _vizSetStatus(statusE, `<span class="info">Selectat: <strong>${labels[mode]}</strong>. Elemente: <strong>${count}</strong> · Sumă: <strong>${sum}</strong></span>`);
  }

  C.querySelectorAll('[data-md]').forEach(btn => {
    const mode = btn.getAttribute('data-md');
    if (mode === 'sum' || mode === 'shuffle' || mode === 'size') return;
    btn.addEventListener('click', () => highlight(mode));
  });
  C.querySelector('[data-md="shuffle"]')?.addEventListener('click', () => {
    mat = _mtxRandom(N); _mtxRender(gridE, mat); if (sumE) sumE.textContent = '—';
    _vizSetStatus(statusE,'Matrice nouă. Apasă un buton pentru a evidenția o zonă.');
  });
  const sizeE = C.querySelector('[data-md="size"]');
  sizeE?.addEventListener('change', () => {
    N = Math.max(3, Math.min(8, parseInt(sizeE.value) || 5));
    mat = _mtxRandom(N); _mtxRender(gridE, mat); if (sumE) sumE.textContent = '—';
    _vizSetStatus(statusE,`Dimensiune nouă: ${N}×${N}.`);
  });

  _mtxRender(gridE, mat);
  _vizSetStatus(statusE,'Apasă un buton pentru a evidenția diagonale, triunghiuri sau bordura.');
}

/* ── 20. Transpose viz ───────────────────────────────────────── */
function initMatrixTransposeViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const gridE   = C.querySelector('.mtx-grid');
  const statusE = C.querySelector('.viz-status');
  const swapE   = C.querySelector('[data-mt="swap"]');
  if (!gridE) return;

  const N = 4;
  const INITIAL = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]];
  let mat = INITIAL.map(r => r.slice());
  let busy = false;

  C.querySelector('[data-mt="go"]')?.addEventListener('click', async () => {
    if (busy) return; busy = true;
    let swaps = 0;
    _vizSetStatus(statusE,'<span class="info">Transpune in-place: swap(a[i][j], a[j][i]) pentru j&gt;i.</span>');
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const cls = {}; cls[`${i},${j}`] = 'swap-a cur'; cls[`${j},${i}`] = 'swap-b cur';
        _mtxRender(gridE, mat, { classes: cls });
        _vizSetStatus(statusE,`↔ swap(a[${i+1}][${j+1}] = ${mat[i][j]}, a[${j+1}][${i+1}] = ${mat[j][i]})`);
        await _vizSleep();
        const t = mat[i][j]; mat[i][j] = mat[j][i]; mat[j][i] = t;
        swaps++;
        if (swapE) swapE.textContent = swaps;
        _mtxRender(gridE, mat, { classes: cls });
        await _vizSleep(Math.max(120,(window.animSpeed ?? 350)*0.4));
      }
    }
    const done = {}; for (let i=0;i<N;i++) for (let j=0;j<N;j++) done[`${i},${j}`] = 'done';
    _mtxRender(gridE, mat, { classes: done });
    _vizSetStatus(statusE,`<span class="ok">✅ Transpusă! ${swaps} interschimbări (= n(n-1)/2 = ${N*(N-1)/2} pentru n=${N}).</span>`);
    busy = false;
  });
  C.querySelector('[data-mt="reset"]')?.addEventListener('click', () => {
    if (busy) return;
    mat = INITIAL.map(r => r.slice());
    _mtxRender(gridE, mat);
    if (swapE) swapE.textContent = '0';
    _vizSetStatus(statusE,'Matrice resetată.');
  });
  _mtxRender(gridE, mat);
  _vizSetStatus(statusE,'Apasă <strong>Transpune</strong> pentru a vedea swap-urile pas cu pas.');
}

/* ── 21. Rotation 90° viz ────────────────────────────────────── */
function initMatrixRotateViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const gridOrig = C.querySelector('[data-mr="orig"] .mtx-grid');
  const gridDest = C.querySelector('[data-mr="dest"] .mtx-grid');
  const statusE  = C.querySelector('.viz-status');
  const dirE     = C.querySelector('[data-mr="dir"]');
  if (!gridOrig || !gridDest) return;

  const N = 4;
  const INITIAL = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]];
  let mat  = INITIAL.map(r => r.slice());
  let dest = Array.from({length:N},()=>Array(N).fill(null));
  let busy = false;

  C.querySelector('[data-mr="go"]')?.addEventListener('click', async () => {
    if (busy) return; busy = true;
    dest = Array.from({length:N},()=>Array(N).fill(null));
    const cw = (dirE?.value || 'cw') === 'cw';
    _mtxRender(gridOrig, mat);
    _mtxRender(gridDest, dest);
    _vizSetStatus(statusE,`<span class="info">Rotire 90° ${cw?'orar (CW)':'antiorar (CCW)'}: b[${cw?'j][n-i+1':'n-j+1][i'}] = a[i][j]</span>`);
    await _vizSleep(500);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const ni = cw ? j : (N - 1 - j);
        const nj = cw ? (N - 1 - i) : i;
        const oc = {}; oc[`${i},${j}`] = 'swap-a cur';
        const dc = {}; dc[`${ni},${nj}`] = 'swap-b cur';
        _mtxRender(gridOrig, mat,  { classes: oc });
        _mtxRender(gridDest, dest, { classes: dc });
        _vizSetStatus(statusE,`a[${i+1}][${j+1}] = ${mat[i][j]} → b[${ni+1}][${nj+1}]`);
        await _vizSleep();
        dest[ni][nj] = mat[i][j];
        _mtxRender(gridDest, dest, { classes: dc });
        await _vizSleep(Math.max(80,(window.animSpeed??350)*0.3));
      }
    }
    const done = {}; for (let i=0;i<N;i++) for (let j=0;j<N;j++) done[`${i},${j}`] = 'done';
    _mtxRender(gridOrig, mat);
    _mtxRender(gridDest, dest, { classes: done });
    _vizSetStatus(statusE,`<span class="ok">✅ Rotire completă! ${N*N} mutări (O(n²)).</span>`);
    busy = false;
  });
  C.querySelector('[data-mr="reset"]')?.addEventListener('click', () => {
    if (busy) return;
    mat = INITIAL.map(r => r.slice());
    dest = Array.from({length:N},()=>Array(N).fill(null));
    _mtxRender(gridOrig, mat); _mtxRender(gridDest, dest);
    _vizSetStatus(statusE,'Resetat.');
  });
  _mtxRender(gridOrig, mat);
  _mtxRender(gridDest, dest);
  _vizSetStatus(statusE,'Alege sensul, apoi apasă <strong>Rotește</strong>.');
}

/* ── 22. Spiral traversal viz ─────────────────────────────────── */
function initMatrixSpiralViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const gridE   = C.querySelector('.mtx-grid');
  const outE    = C.querySelector('[data-ms="out"]');
  const statusE = C.querySelector('.viz-status');
  if (!gridE) return;

  const N = 5;
  let mat = _mtxRandom(N, 1, 99);
  let busy = false;

  C.querySelector('[data-ms="go"]')?.addEventListener('click', async () => {
    if (busy) return; busy = true;
    if (outE) outE.textContent = '';
    let top = 0, bot = N - 1, left = 0, right = N - 1;
    const visited = {};
    const out = [];
    _vizSetStatus(statusE,'<span class="info">Parcurgem 4 direcții pe rând: ↦ ↧ ↤ ↥</span>');
    while (top <= bot && left <= right) {
      for (let j = left; j <= right; j++)  { visited[`${top},${j}`] = 'spiral cur'; _mtxRender(gridE, mat, { classes: visited }); out.push(mat[top][j]); if (outE) outE.textContent = out.join(' '); await _vizSleep(Math.max(100,(window.animSpeed??350)*0.5)); visited[`${top},${j}`] = 'spiral'; }
      top++;
      for (let i = top; i <= bot; i++)    { visited[`${i},${right}`] = 'spiral cur'; _mtxRender(gridE, mat, { classes: visited }); out.push(mat[i][right]); if (outE) outE.textContent = out.join(' '); await _vizSleep(Math.max(100,(window.animSpeed??350)*0.5)); visited[`${i},${right}`] = 'spiral'; }
      right--;
      if (top <= bot) {
        for (let j = right; j >= left; j--) { visited[`${bot},${j}`] = 'spiral cur'; _mtxRender(gridE, mat, { classes: visited }); out.push(mat[bot][j]); if (outE) outE.textContent = out.join(' '); await _vizSleep(Math.max(100,(window.animSpeed??350)*0.5)); visited[`${bot},${j}`] = 'spiral'; }
        bot--;
      }
      if (left <= right) {
        for (let i = bot; i >= top; i--) { visited[`${i},${left}`] = 'spiral cur'; _mtxRender(gridE, mat, { classes: visited }); out.push(mat[i][left]); if (outE) outE.textContent = out.join(' '); await _vizSleep(Math.max(100,(window.animSpeed??350)*0.5)); visited[`${i},${left}`] = 'spiral'; }
        left++;
      }
    }
    const done = {}; for (let i=0;i<N;i++) for (let j=0;j<N;j++) done[`${i},${j}`] = 'done';
    _mtxRender(gridE, mat, { classes: done });
    _vizSetStatus(statusE,`<span class="ok">✅ ${out.length} elemente parcurse în spirală.</span>`);
    busy = false;
  });
  C.querySelector('[data-ms="shuffle"]')?.addEventListener('click', () => {
    if (busy) return;
    mat = _mtxRandom(N, 1, 99);
    _mtxRender(gridE, mat);
    if (outE) outE.textContent = '';
    _vizSetStatus(statusE,'Matrice nouă.');
  });
  _mtxRender(gridE, mat);
  _vizSetStatus(statusE,'Apasă <strong>Start</strong> pentru parcurgere în spirală.');
}

/* ── 23. Palindrom step-by-step (two-pointer) ──────────────── */
function initPalindromViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const rowE    = C.querySelector('[data-pal="row"]');
  const statusE = C.querySelector('.viz-status');
  const inputE  = C.querySelector('[data-pal="input"]');
  if (!rowE) return;

  function render(s, l, r, status) {
    rowE.innerHTML = '';
    for (let i = 0; i < s.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'pal-cell';
      if (status === 'fail' && (i === l || i === r)) cell.classList.add('mismatch');
      else if (status === 'ok' && (i === l || i === r)) cell.classList.add('match');
      else if (status === 'done') cell.classList.add('done');
      else if (i === l) cell.classList.add('left');
      else if (i === r) cell.classList.add('right');
      const ch = document.createElement('div'); ch.className = 'pal-char'; ch.textContent = s[i] === ' ' ? '␣' : s[i];
      const idx = document.createElement('div'); idx.className = 'pal-idx'; idx.textContent = i;
      cell.appendChild(ch); cell.appendChild(idx);
      rowE.appendChild(cell);
    }
  }

  let busy = false;
  C.querySelector('[data-pal="go"]')?.addEventListener('click', async () => {
    if (busy) return; busy = true;
    const raw = (inputE?.value ?? 'radar').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!raw) { _vizSetStatus(statusE,'<span class="warn">Introdu un șir.</span>'); busy=false; return; }
    let l = 0, r = raw.length - 1;
    render(raw, l, r);
    _vizSetStatus(statusE, `Comparăm s[${l}]='${raw[l]}' cu s[${r}]='${raw[r]}'`);
    await _vizSleep();
    while (l < r) {
      if (raw[l] !== raw[r]) {
        render(raw, l, r, 'fail');
        _vizSetStatus(statusE, `<span class="bad">❌ s[${l}]='${raw[l]}' ≠ s[${r}]='${raw[r]}' → NU este palindrom.</span>`);
        busy = false; return;
      }
      render(raw, l, r, 'ok');
      _vizSetStatus(statusE, `✓ s[${l}]='${raw[l]}' = s[${r}]='${raw[r]}'`);
      await _vizSleep();
      l++; r--;
      if (l < r) {
        render(raw, l, r);
        _vizSetStatus(statusE, `Comparăm s[${l}]='${raw[l]}' cu s[${r}]='${raw[r]}'`);
        await _vizSleep();
      }
    }
    render(raw, -1, -1, 'done');
    _vizSetStatus(statusE,'<span class="ok">✅ Este palindrom!</span>');
    busy = false;
  });

  C.querySelector('[data-pal="example"]')?.addEventListener('click', () => {
    if (busy) return;
    const examples = ['radar', 'level', 'madam', 'rotor', 'bacalaureat', 'informatica', 'aibofobia'];
    if (inputE) inputE.value = examples[Math.floor(Math.random() * examples.length)];
    render(inputE.value.toLowerCase(), -1, -1);
    _vizSetStatus(statusE, 'Apasă <strong>Verifică</strong> pentru a începe.');
  });

  if (inputE) render(inputE.value || 'radar', -1, -1);
  _vizSetStatus(statusE, 'Cei doi pointeri (st, dr) avansează unul spre celălalt.');
}

/* ── 24. Caesar cipher animation ───────────────────────────── */
function initCaesarViz(containerId) {
  const C = document.getElementById(containerId); if (!C) return;
  const inE    = C.querySelector('[data-cs="in"]');
  const outE   = C.querySelector('[data-cs="out"]');
  const kE     = C.querySelector('[data-cs="k"]');
  const wheelE = C.querySelector('[data-cs="wheel"]');
  const statusE = C.querySelector('.viz-status');
  if (!inE || !outE) return;

  function renderWheel(ch, k) {
    if (!wheelE) return;
    wheelE.innerHTML = '';
    if (!ch || !/[a-z]/i.test(ch)) return;
    const isUp = ch >= 'A' && ch <= 'Z';
    const base = isUp ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
    const idx = ch.charCodeAt(0) - base;
    const target = (idx + k + 26) % 26;
    for (let i = 0; i < 26; i++) {
      const cell = document.createElement('span');
      cell.className = 'cs-letter';
      cell.textContent = String.fromCharCode(base + i);
      if (i === idx) cell.classList.add('orig');
      if (i === target) cell.classList.add('shift');
      wheelE.appendChild(cell);
    }
  }

  async function run(decrypt) {
    let s = inE.value ?? '';
    let k = parseInt(kE?.value ?? '3', 10);
    if (isNaN(k)) k = 3;
    if (decrypt) k = -k;
    let out = '';
    outE.innerHTML = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      let res = ch;
      if (ch >= 'a' && ch <= 'z') {
        const idx = (ch.charCodeAt(0) - 97 + k + 26 * 10) % 26;
        res = String.fromCharCode(97 + idx);
      } else if (ch >= 'A' && ch <= 'Z') {
        const idx = (ch.charCodeAt(0) - 65 + k + 26 * 10) % 26;
        res = String.fromCharCode(65 + idx);
      }
      out += res;
      const span = document.createElement('span'); span.className = 'cs-out-ch'; span.textContent = res;
      outE.appendChild(span);
      renderWheel(ch, k);
      _vizSetStatus(statusE, `'${ch}' ${decrypt ? '−' : '+'} ${Math.abs(k)} → '${res}'`);
      await _vizSleep(Math.max(80, (window.animSpeed ?? 350) * 0.4));
    }
    _vizSetStatus(statusE, `<span class="ok">✅ ${decrypt ? 'Decriptat' : 'Criptat'}: ${out}</span>`);
  }

  C.querySelector('[data-cs="enc"]')?.addEventListener('click', () => run(false));
  C.querySelector('[data-cs="dec"]')?.addEventListener('click', () => run(true));
  _vizSetStatus(statusE, 'Apasă <strong>Criptează</strong> pentru a vedea fiecare caracter rotit cu k poziții.');
}

