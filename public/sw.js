/* EchoWAI — Service Worker minimal pour PWA installable.
   - Pré-cache des assets statiques essentiels
   - Network-first sur HTML + API, fallback cache
   - Cache-first sur JS/CSS/images */
const CACHE = 'echowai-v1';
const PRECACHE = [
  '/', '/site.webmanifest', '/favicon.svg',
  '/favicon-32.png', '/favicon-16.png', '/apple-touch-icon.png',
  '/css/echowai.css', '/site/tokens.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Network-first pour HTML + /api (latence acceptable + cohérence)
  if (req.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req).then(r => {
        if (r.ok && req.mode === 'navigate') {
          const cp = r.clone();
          caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {});
        }
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // Cache-first pour le reste
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); }
      return r;
    }).catch(() => cached))
  );
});
