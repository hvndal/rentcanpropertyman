document = null;
const CACHE_NAME = 'rentcan-v1';
const ASSETS = [
  '/dashboard.html',
  '/inspections.html',
  '/admin.html',
  '/documents.html',
  '/payments.html',
  '/reports.html',
  '/js/app.js',
  '/styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
