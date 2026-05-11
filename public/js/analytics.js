/* ═══════════════════════════════════════════════════════════════
   analytics.js — Lightweight, privacy-respecting usage tracking
   Stores all data in localStorage only. No external services.
═══════════════════════════════════════════════════════════════ */

(function() {
  var ANALYTICS_KEY = 'infoLiceu_analytics';

  function getAnalytics() {
    try {
      return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function saveAnalytics(data) {
    try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data)); } catch(e) {}
  }

  function trackPageView() {
    var data = getAnalytics();
    var today = new Date().toISOString().slice(0, 10);
    var path = window.location.pathname;

    // Initialize
    if (!data.pageViews) data.pageViews = {};
    if (!data.dailyViews) data.dailyViews = {};
    if (!data.totalViews) data.totalViews = 0;

    // Track page
    data.pageViews[path] = (data.pageViews[path] || 0) + 1;

    // Track daily
    if (!data.dailyViews[today]) data.dailyViews[today] = 0;
    data.dailyViews[today]++;

    // Total
    data.totalViews++;

    // Keep only last 30 days of daily views
    var keys = Object.keys(data.dailyViews).sort();
    if (keys.length > 30) {
      var toRemove = keys.slice(0, keys.length - 30);
      toRemove.forEach(function(k) { delete data.dailyViews[k]; });
    }

    // Track last visit
    data.lastVisit = today;
    data.lastPage = path;

    saveAnalytics(data);
  }

  // Track on page load
  trackPageView();

  // Expose for reading stats
  window.getInfoLiceuAnalytics = getAnalytics;
})();
