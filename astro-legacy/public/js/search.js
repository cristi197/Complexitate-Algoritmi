var _searchSelectedIdx = -1;
var _searchReturnFocus;

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function openSearch(trigger) {
  var modal = document.getElementById('searchModal');
  if (!modal || modal.open) return;
  if (window.closeChapterMenu) window.closeChapterMenu();
  // Safari does not focus buttons on click, so activeElement can be <body>.
  var active = document.activeElement;
  _searchReturnFocus = trigger instanceof HTMLElement ? trigger
    : (active && active !== document.body ? active : document.getElementById('search-trigger'));
  modal.showModal();
  document.body.classList.add('search-open');
  var input = document.getElementById('searchInput');
  input.value = '';
  doSearch('');
  input.focus();
}

function closeSearch() {
  var modal = document.getElementById('searchModal');
  if (modal && modal.open) modal.close();
}

function doSearch(query) {
  var list = document.getElementById('searchResults');
  if (!list) return;
  var q = normalizeSearch(query || '');
  var index = Array.from(document.querySelectorAll('[data-search-entry]')).map(function(entry) {
    return { title: entry.dataset.searchTitle, subtitle: entry.dataset.searchSummary, href: entry.href };
  });
  var results = index.filter(function(item) { return normalizeSearch(item.title + ' ' + item.subtitle).includes(q); });
  list.replaceChildren();
  _searchSelectedIdx = -1;
  results.forEach(function(item) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.href = item.href;
    var title = document.createElement('strong');
    title.textContent = item.title;
    var description = document.createElement('span');
    description.textContent = item.subtitle;
    link.append(title, description);
    li.append(link);
    list.append(li);
  });
  if (!results.length) {
    var empty = document.createElement('li');
    empty.className = 'search-empty';
    empty.textContent = 'Niciun rezultat. Încearcă un alt termen.';
    list.append(empty);
  }
  document.getElementById('search-count').textContent = results.length + ' rezultate';
}

document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('searchModal');
  var input = document.getElementById('searchInput');
  input.addEventListener('input', function() { doSearch(input.value); });
  input.addEventListener('keydown', function(event) {
    var links = Array.from(modal.querySelectorAll('#searchResults a'));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!links.length) return;
      if (links[_searchSelectedIdx]) links[_searchSelectedIdx].classList.remove('active');
      _searchSelectedIdx = (_searchSelectedIdx + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[_searchSelectedIdx].classList.add('active');
      links[_searchSelectedIdx].scrollIntoView({ block: 'nearest' });
    }
    if (event.key === 'Enter' && links.length) {
      event.preventDefault();
      links[Math.max(0, _searchSelectedIdx)].click();
    }
  });
  modal.addEventListener('click', function(event) { if (event.target === modal) closeSearch(); });
  modal.addEventListener('cancel', function(event) { event.preventDefault(); closeSearch(); });
  modal.addEventListener('close', function() {
    document.body.classList.remove('search-open');
    if (_searchReturnFocus) _searchReturnFocus.focus();
  });
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.open) { event.preventDefault(); closeSearch(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      modal.open ? closeSearch() : openSearch();
    }
  });
});
