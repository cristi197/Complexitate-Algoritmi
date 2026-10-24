(function() {
  function init() {
    var themeButton = document.getElementById('theme-toggle');
    function syncTheme() {
      if (themeButton) themeButton.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
    }
    if (themeButton) themeButton.addEventListener('click', function() {
      var theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (_) {}
      syncTheme();
    });
    syncTheme();

    var menuButton = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var mobile = window.matchMedia('(max-width: 1023px)');
    var main = document.querySelector('main') || document.querySelector('.app-content');
    var footer = document.querySelector('.site-footer');
    function closeMenu(restoreFocus) {
      if (!sidebar) return;
      sidebar.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Deschide meniul');
      document.body.classList.remove('menu-open');
      sidebar.inert = mobile.matches;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
      if (restoreFocus) menuButton.focus();
    }
    window.closeChapterMenu = function() { closeMenu(false); };
    if (sidebar && menuButton) {
      sidebar.inert = mobile.matches;
      menuButton.addEventListener('click', function() {
        if (sidebar.classList.contains('open')) { closeMenu(true); return; }
        sidebar.inert = false;
        sidebar.classList.add('open');
        document.body.classList.add('menu-open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Închide meniul');
        if (main) main.inert = true;
        if (footer) footer.inert = true;
        (sidebar.querySelector('[aria-current="page"]') || sidebar.querySelector('a')).focus();
      });
      if (overlay) overlay.addEventListener('click', function() { closeMenu(true); });
      sidebar.addEventListener('click', function(event) {
        if (event.target.closest('a') && mobile.matches) closeMenu(false);
      });
      mobile.addEventListener('change', function() { closeMenu(false); });
      document.addEventListener('keydown', function(event) {
        if (!sidebar.classList.contains('open')) return;
        if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
        if (event.key === 'Tab') {
          var focusable = [menuButton].concat(Array.from(sidebar.querySelectorAll('a, button, [tabindex="0"]')));
          var current = focusable.indexOf(document.activeElement);
          event.preventDefault();
          focusable[(current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
        }
      });
    } else if (menuButton) menuButton.hidden = true;

    var outline = document.getElementById('lesson-outline');
    if (outline) {
      var compact = window.matchMedia('(max-width: 1200px)');
      outline.open = !compact.matches;
      compact.addEventListener('change', function() { outline.open = !compact.matches; });
      outline.addEventListener('click', function(event) {
        if (event.target.closest('a') && compact.matches) outline.open = false;
      });
      var links = Array.from(outline.querySelectorAll('a[href^="#"]'));
      var sections = links.map(function(link) { return document.getElementById(link.hash.slice(1)); }).filter(Boolean);
      var scheduled = false;
      function updateReading() {
        scheduled = false;
        var active = sections[0];
        sections.forEach(function(section) {
          if (section.getBoundingClientRect().top <= 160) active = section;
        });
        links.forEach(function(link) {
          if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        var total = document.documentElement.scrollHeight - innerHeight;
        var pct = total > 0 ? Math.round(Math.min(100, Math.max(0, scrollY / total * 100))) : 100;
        document.getElementById('lesson-progress').value = pct;
        document.getElementById('lesson-progress-text').textContent = pct + '%';
      }
      addEventListener('scroll', function() {
        if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
      }, { passive: true });
      updateReading();
    }

    // Give wide reference tables their own scroll region instead of widening the page.
    document.querySelectorAll('main table, .app-content table').forEach(function(table, index) {
      if (table.closest('.table-scroll, .table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      var heading = table.closest('section')?.querySelector('h2');
      wrap.setAttribute('aria-label', heading ? 'Tabel: ' + heading.textContent.trim() : 'Tabel ' + (index + 1));
      table.before(wrap);
      wrap.append(table);
    });

    document.querySelectorAll('.table-wrap').forEach(function(wrap) {
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Tabel de referință');
    });

    document.querySelectorAll('label').forEach(function(label, index) {
      if (label.htmlFor || label.querySelector('input, select, textarea')) return;
      var input = label.nextElementSibling;
      if (!input || !input.matches('input, select, textarea')) return;
      if (!input.id) input.id = 'lesson-field-' + index;
      label.htmlFor = input.id;
    });

    var catalog = document.getElementById('chapter-catalog');
    if (catalog) {
      var search = document.getElementById('catalog-query');
      var filters = Array.from(document.querySelectorAll('[data-catalog-filter]'));
      var cards = Array.from(catalog.querySelectorAll('[data-catalog-chapter]'));
      var group = 'all';
      function normalized(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
      function filter() {
        var query = normalized(search.value.trim());
        var count = 0;
        cards.forEach(function(card) {
          var matches = (group === 'all' || card.dataset.group === group) && normalized(card.textContent).includes(query);
          card.hidden = !matches;
          if (matches) count++;
        });
        document.getElementById('catalog-count').textContent = count + ' capitole';
        document.getElementById('catalog-empty').hidden = count > 0;
      }
      filters.forEach(function(button) {
        button.addEventListener('click', function() {
          group = button.dataset.catalogFilter;
          filters.forEach(function(filterButton) { filterButton.setAttribute('aria-pressed', String(filterButton === button)); });
          filter();
        });
      });
      search.addEventListener('input', filter);
      try {
        var progress = JSON.parse(localStorage.getItem('infoLiceu_v2') || '{}');
        cards.forEach(function(card) {
          if (progress.visited && progress.visited[card.dataset.catalogChapter]) card.classList.add('visited');
        });
      } catch (_) {}
      filter();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
