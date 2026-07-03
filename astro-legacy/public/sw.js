/* ═══════════════════════════════════════════════════════════════
   Service Worker — InfoLiceu PWA offline caching
═══════════════════════════════════════════════════════════════ */

var CACHE_NAME = 'infoLiceu-v2';
var BASE = '';

var PRECACHE_URLS = [
  BASE + '/',
  BASE + '/exercitii',
  BASE + '/cheat-sheet',
  BASE + '/editor',
  BASE + '/streak',
  BASE + '/examen-alb',
  BASE + '/js/search.js',
  BASE + '/js/progress.js',
  BASE + '/js/platform.js',
  BASE + '/data/exercises/introducere.json',
  BASE + '/data/exercises/complexitate.json',
  BASE + '/data/exercises/recursivitate.json',
  BASE + '/data/exercises/backtracking.json',
  BASE + '/data/exercises/vectori.json',
  BASE + '/data/exercises/matrici.json',
  BASE + '/data/exercises/siruri.json',
  BASE + '/data/exercises/fisiere.json',
  BASE + '/data/exercises/functii.json',
  BASE + '/data/exercises/pointeri.json',
  BASE + '/data/exercises/programare-dinamica.json',
  BASE + '/data/exercises/structuri.json',
];

// Install: precache key resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful responses
      if (response.ok) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // Network failed, try cache
      return caches.match(event.request);
    })
  );
});
