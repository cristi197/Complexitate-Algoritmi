/* ═══════════════════════════════════════════════════════════════
   search.js — Ctrl+K search modal for InfoLiceu
═══════════════════════════════════════════════════════════════ */

var SEARCH_INDEX = [
  { title: 'Introducere în Informatică', subtitle: 'Bazele C++, tipuri de date, algoritmi', url: 'introducere', icon: '🖥️' },
  { title: 'Funcții și Subprograme',      subtitle: 'Parametri, referințe, variabile',       url: 'functii',    icon: '⚙️' },
  { title: 'Eficiența Algoritmilor',      subtitle: 'Big-O, complexitate timp și spațiu',    url: 'complexitate',icon: '📊' },
  { title: 'Recursivitate',               subtitle: 'Funcții recursive, stiva de apeluri',   url: 'recursivitate',icon: '🔄' },
  { title: 'Backtracking',                subtitle: 'Căutare exhaustivă, N-Regine',          url: 'backtracking',icon: '🌳' },
  { title: 'Vectori (Tablouri 1D)',        subtitle: 'Operații, sortare, ciurul Eratostene',  url: 'vectori',    icon: '📦' },
  { title: 'Matrici (Tablouri 2D)',        subtitle: 'Diagonale, transpusă, spirală',         url: 'matrici',    icon: '🔲' },
  { title: 'Șiruri de Caractere',         subtitle: 'char[], string, palindrom, anagramă',   url: 'siruri',     icon: '🔤' },
  { title: 'Fișiere',                     subtitle: 'fstream, citire/scriere, EOF',           url: 'fisiere',    icon: '📁' },
  { title: 'Programare Dinamică',         subtitle: 'Memoizare, DP tabelar, LIS',            url: 'programare-dinamica', icon: '🧮' },
  { title: 'Structuri (struct)',           subtitle: 'Tipuri definite, array de structuri',    url: 'structuri',  icon: '🗂️' },
  { title: 'Pointeri & Alocare Dinamică', subtitle: 'new/delete, aritmetică pointeri',        url: 'pointeri',   icon: '🔗' },
  { title: 'Teoria Grafurilor',           subtitle: 'BFS, DFS, componente conexe, formule',   url: 'grafuri',    icon: '🕸️' },
  { title: 'Exerciții & Filtrare',        subtitle: 'Quiz-uri BAC pe capitol și dificultate', url: 'exercitii', icon: '📝', isPage: true },
  { title: 'Analiză BAC cu AI',           subtitle: 'Analizează subiectul tău cu AI',        url: 'analiza-bac', icon: '🤖', isPage: true },
  { title: 'Debug Live',                  subtitle: 'Urmărește pas cu pas execuția unui algoritm', url: 'debug-live', icon: '🔍', isPage: true },
  { title: 'Cheat Sheet',                 subtitle: 'Referință rapidă printabilă',            url: 'cheat-sheet', icon: '📄', isPage: true },
  { title: 'Editor C++ Online',           subtitle: 'Scrie și compilează C++ în browser',     url: 'editor', icon: '⌨️', isPage: true },
  { title: 'Examen Alb 3h',               subtitle: 'Simulare completă BAC la timp',          url: 'examen-alb', icon: '⏱️', isPage: true },
];

var _searchSelectedIdx = -1;

function openSearch() {
  var modal = document.getElementById('searchModal');
  var input = document.getElementById('searchInput');
  if (!modal) return;
  modal.classList.add('open');
  if (input) { input.value = ''; input.focus(); }
  _searchSelectedIdx = -1;
  doSearch('');
}

function closeSearch() {
  var modal = document.getElementById('searchModal');
  if (modal) modal.classList.remove('open');
}

function doSearch(query) {
  var list = document.getElementById('searchResults');
  if (!list) return;
  var q = (query || '').toLowerCase().trim();
  var results = q
    ? SEARCH_INDEX.filter(function(item) {
        return item.title.toLowerCase().indexOf(q) !== -1 ||
               item.subtitle.toLowerCase().indexOf(q) !== -1;
      })
    : SEARCH_INDEX;

  list.innerHTML = '';
  _searchSelectedIdx = -1;

  if (results.length === 0) {
    list.innerHTML = '<li style="padding:16px;text-align:center;color:var(--text-muted)">Nicio sugestie găsită</li>';
    return;
  }

  var base = (window.__BASE_URL || (document.querySelector('meta[name="base-url"]') ? document.querySelector('meta[name="base-url"]').content : '')).replace(/\/+$/, '');
  results.forEach(function(item, i) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.innerHTML =
      '<span style="font-size:20px;width:28px;text-align:center;flex-shrink:0">' + item.icon + '</span>' +
      '<span><span class="sr-title">' + item.title + '</span><br>' +
      '<span style="font-size:12px;color:var(--text-muted)">' + item.subtitle + '</span></span>';

    var href = item.isPage
      ? base + '/' + item.url
      : base + '/capitole/' + item.url;

    li.addEventListener('click', function() { window.location.href = href; closeSearch(); });
    list.appendChild(li);
  });
}

function _searchMove(dir) {
  var items = document.querySelectorAll('#searchResults li');
  if (!items.length) return;
  items[_searchSelectedIdx] && items[_searchSelectedIdx].classList.remove('active');
  _searchSelectedIdx = (_searchSelectedIdx + dir + items.length) % items.length;
  items[_searchSelectedIdx].classList.add('active');
  items[_searchSelectedIdx].scrollIntoView({ block: 'nearest' });
}

function _searchConfirm() {
  var items = document.querySelectorAll('#searchResults li');
  if (_searchSelectedIdx >= 0 && items[_searchSelectedIdx]) {
    items[_searchSelectedIdx].click();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('input', function() { doSearch(this.value); });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown')  { e.preventDefault(); _searchMove(1); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); _searchMove(-1); }
      if (e.key === 'Enter')      { e.preventDefault(); _searchConfirm(); }
      if (e.key === 'Escape')     { closeSearch(); }
    });
  }
});

document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var modal = document.getElementById('searchModal');
    if (modal && modal.classList.contains('open')) { closeSearch(); }
    else { openSearch(); }
  }
  if (e.key === 'Escape') { closeSearch(); }
});
