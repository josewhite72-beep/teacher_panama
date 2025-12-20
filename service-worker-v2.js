/* TeacherPanama Pro Service Worker v2 (GitHub Pages subcarpeta) */
const CACHE = 'tp-shell-v2';
const CDN_CACHE = 'tp-cdn-v2';
const SHELL = [
  '/teacher_panama/',
  '/teacher_panama/index.html',
  '/teacher_panama/manifest.json',
  '/teacher_panama/icons/icon-192.png',
  '/teacher_panama/icons/icon-512.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => ![CACHE, CDN_CACHE].includes(k) && caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isCDN = /unpkg\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/.test(url.host);
  // NAVIGATION: network-first — ensures new index.html is fetched
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/teacher_panama/index.html')));
    return;
  }
  if (isCDN) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CDN_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }
  // Local: cache-first with background update
  event.respondWith(
    caches.match(req).then(r => r || fetch(req).then(net => {
      return caches.open(CACHE).then(c => { c.put(req, net.clone()); return net; });
    }))
  );
});
