/* ═══════════════════════════════════════════════════════════════
   charts.js — Chart.js visualizations for InfoLiceu
   Requires Chart.js 4.x loaded before this script
═══════════════════════════════════════════════════════════════ */

/* ── Big-O Complexity chart ─────────────────────────────────── */
function renderBigOChart(n) {
  var canvas = document.getElementById('bigOChart');
  if (!canvas || typeof Chart === 'undefined') return;

  n = n || 20;
  var labels = [];
  for (var i = 1; i <= n; i++) labels.push(i);

  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  var textColor = isDark ? '#8b949e' : '#64748b';

  var datasets = [
    { label: 'O(1)',       data: labels.map(function() { return 1; }),                          borderColor: '#10b981', tension: 0.4 },
    { label: 'O(log n)',   data: labels.map(function(x) { return Math.log2(x); }),              borderColor: '#06b6d4', tension: 0.4 },
    { label: 'O(n)',       data: labels.map(function(x) { return x; }),                         borderColor: '#6366f1', tension: 0.4 },
    { label: 'O(n log n)', data: labels.map(function(x) { return x * Math.log2(x); }),          borderColor: '#a855f7', tension: 0.4 },
    { label: 'O(n²)',      data: labels.map(function(x) { return x * x; }),                    borderColor: '#f59e0b', tension: 0.4 },
    { label: 'O(2ⁿ)',      data: labels.map(function(x) { return x <= 10 ? Math.pow(2, x) : null; }), borderColor: '#ef4444', tension: 0.4 },
  ].map(function(d) {
    d.fill = false;
    d.borderWidth = 2;
    d.pointRadius = 0;
    return d;
  });

  if (canvas._chartInstance) { canvas._chartInstance.destroy(); }

  canvas._chartInstance = new Chart(canvas, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: textColor, font: { size: 12 } } },
        tooltip: { mode: 'index' }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: {
          grid: { color: gridColor }, ticks: { color: textColor },
          max: n * n
        }
      }
    }
  });
}

/* ── Sorting algorithms comparison chart ─────────────────────── */
function renderSortingChart() {
  var canvas = document.getElementById('sortingChart');
  if (!canvas || typeof Chart === 'undefined') return;

  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  var textColor = isDark ? '#8b949e' : '#64748b';

  var algorithms = ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort'];
  var bestCase  = [1, 2, 1, 4, 3, 4]; // relative log scale: 1=O(n), 2=O(n²), 3=O(nlogn), 4=O(nlogn)
  var worstCase = [2, 2, 2, 4, 2, 4];
  var spaceCase = [1, 1, 1, 3, 2, 1]; // 1=O(1), 2=O(log n), 3=O(n)

  if (canvas._chartInstance) { canvas._chartInstance.destroy(); }

  canvas._chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: algorithms,
      datasets: [
        { label: 'Cel mai bun caz', data: bestCase,  backgroundColor: 'rgba(16,185,129,0.7)' },
        { label: 'Cel mai rău caz', data: worstCase, backgroundColor: 'rgba(239,68,68,0.7)' },
        { label: 'Spațiu',          data: spaceCase, backgroundColor: 'rgba(99,102,241,0.7)' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              var map = { 1: 'O(n)', 2: 'O(n²)', 3: 'O(log n)', 4: 'O(n log n)' };
              return ctx.dataset.label + ': ' + (map[ctx.raw] || ctx.raw);
            }
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: {
          grid: { color: gridColor }, ticks: { color: textColor },
          min: 0, max: 5,
          ticks: {
            callback: function(v) {
              return { 1: 'O(n)', 2: 'O(n²)', 3: 'O(log n)', 4: 'O(n log n)' }[v] || '';
            },
            color: textColor
          }
        }
      }
    }
  });
}

/* ── Init after DOM ready ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  var nSlider = document.getElementById('bigOSlider');
  var nLabel  = document.getElementById('bigOSliderLabel');

  function initBigO() {
    var n = nSlider ? parseInt(nSlider.value) : 20;
    if (nLabel) nLabel.textContent = n;
    renderBigOChart(n);
  }

  if (nSlider) {
    nSlider.addEventListener('input', function() {
      if (nLabel) nLabel.textContent = this.value;
      renderBigOChart(parseInt(this.value));
    });
  }

  // Observe canvas visibility to lazy-init
  var bigOCanvas = document.getElementById('bigOChart');
  var sortCanvas = document.getElementById('sortingChart');

  function tryInit() {
    if (typeof Chart === 'undefined') return;
    initBigO();
    renderSortingChart();
  }

  if (typeof Chart !== 'undefined') {
    tryInit();
  } else {
    // Chart.js may load async — retry
    var retries = 0;
    var interval = setInterval(function() {
      retries++;
      if (typeof Chart !== 'undefined') { clearInterval(interval); tryInit(); }
      if (retries > 20) clearInterval(interval);
    }, 200);
  }
});
