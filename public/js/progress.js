/* ═══════════════════════════════════════════════════════════════
   progress.js — XP system & visited chapters tracking
═══════════════════════════════════════════════════════════════ */

var PROGRESS_KEY = 'infoLiceu_v2';
var XP_PER_VISIT = 10;
var LEVELS = [0, 100, 250, 500, 900, 1400, 2000, 3000, 5000];
var LEVEL_NAMES = ['Începător','Elev','Cunoscător','Avansat','Expert','Master','Campion','Legend','Profesional'];

function getProgress() {
  try {
    var raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { xp: 0, visited: {}, quizScores: {} };
  } catch(e) {
    return { xp: 0, visited: {}, quizScores: {} };
  }
}

function saveProgress(data) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)); } catch(e) {}
}

function getLevelInfo(xp) {
  var lvl = 0;
  for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i]) lvl = i; }
  var nextXP = LEVELS[lvl + 1] || LEVELS[LEVELS.length - 1];
  var prevXP = LEVELS[lvl];
  var pct = Math.min(100, Math.round(((xp - prevXP) / Math.max(1, nextXP - prevXP)) * 100));
  return { level: lvl + 1, name: LEVEL_NAMES[lvl] || 'Pro', pct: pct };
}

function markVisited(chapterId) {
  if (!chapterId) return;
  var data = getProgress();
  var isNew = !data.visited[chapterId];
  data.visited[chapterId] = true;
  if (isNew) {
    data.xp = (data.xp || 0) + XP_PER_VISIT;
    saveProgress(data);
    showXPToast('+' + XP_PER_VISIT + ' XP — Capitol vizitat!');
  } else {
    saveProgress(data);
  }
  // Sync with streak calendar — mark today as a study day
  markStudyDay();
  updateSidebarUI(data);
}

function markStudyDay() {
  var STUDY_KEY = 'infoStudyDays';
  var now = new Date();
  var today = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  try {
    var days = JSON.parse(localStorage.getItem(STUDY_KEY) || '[]');
    if (!days.includes(today)) {
      days.push(today);
      localStorage.setItem(STUDY_KEY, JSON.stringify(days));
    }
  } catch(e) {}
}

function updateSidebarUI(data) {
  if (!data) data = getProgress();
  var xp = data.xp || 0;
  var info = getLevelInfo(xp);

  // Sidebar elements (may be from Sidebar.astro)
  var xpValEl  = document.getElementById('xp-value');
  var xpFillEl = document.getElementById('xp-fill');
  var xpLvlEl  = document.getElementById('xp-level');
  var xpBarEl  = document.querySelector('.xp-bar');

  if (xpValEl)  xpValEl.textContent  = xp;
  if (xpFillEl) xpFillEl.style.width = info.pct + '%';
  if (xpLvlEl)  xpLvlEl.textContent  = 'Nivel ' + info.level + ' — ' + info.name;
  if (xpBarEl)  xpBarEl.setAttribute('aria-valuenow', info.pct);

  // Mark visited dots
  Object.keys(data.visited || {}).forEach(function(ch) {
    var link = document.querySelector('.sidebar-link[href*="' + ch + '"]');
    if (link) link.classList.add('visited');
    var dot = document.querySelector('[id^="dot-"]');
    // Try by chapter file name in href
    var allLinks = document.querySelectorAll('.sidebar-link');
    allLinks.forEach(function(a) {
      if (a.href && a.href.indexOf('/' + ch) !== -1) {
        a.classList.add('visited');
        var d = a.querySelector('.sidebar-progress-dot');
        if (d) d.classList.add('done');
      }
    });
  });
}

function showXPToast(msg) {
  var toast = document.getElementById('xp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'xp-toast';
    toast.className = 'xp-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

/* ── API for quiz.js to award XP ── */
function addXPFromQuiz(amount, chapterId) {
  if (!amount || amount <= 0) return;
  var data = getProgress();
  data.xp = (data.xp || 0) + amount;
  if (chapterId) {
    data.quizScores = data.quizScores || {};
    data.quizScores[chapterId] = (data.quizScores[chapterId] || 0) + amount;
  }
  saveProgress(data);
  updateSidebarUI(data);
  showXPToast('+' + amount + ' XP — Quiz completat!');
}

/* ── Expose globally for quiz.js and sidebar ── */
window.addXPFromQuiz = addXPFromQuiz;
window.refreshProgressUI = function() { updateSidebarUI(); };

// Auto-detect chapter from URL and mark visited
document.addEventListener('DOMContentLoaded', function() {
  // Detect chapter from URL path (e.g. /capitole/vectori)
  var pathParts = window.location.pathname.split('/');
  var capitoleIdx = pathParts.indexOf('capitole');
  if (capitoleIdx !== -1 && pathParts[capitoleIdx + 1]) {
    var chapterId = pathParts[capitoleIdx + 1];
    // Delay slightly so page is rendered
    setTimeout(function() { markVisited(chapterId); }, 800);
  } else {
    // Not a chapter page — just update UI
    updateSidebarUI();
  }
});
