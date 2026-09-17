// Bump this every time you deploy a meaningful change — changing the string
// forces the browser to treat this as a new service worker, which then
// clears out old caches on activate.
const CACHE = 'th-spending-v6';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Only ever intercept GET requests — the Cache API can't store
  // POST/PUT requests anyway, and trying to do so just throws unhandled
  // errors in the console.
  if (req.method !== 'GET') return;

  // Never touch cross-origin requests (Google Fonts, etc). Only manage
  // caching for our own same-origin app files.
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
