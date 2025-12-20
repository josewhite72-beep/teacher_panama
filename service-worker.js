/* TeacherPanama Pro Service Worker (GitHub Pages subfolder) */
const CACHE = 'tp-shell-v1';
const CDN_CACHE = 'tp-cdn-v1';

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
  const isCDN = /unpkg\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host);

  // App Shell for navigations
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('/teacher_panama/index.html').then(r => r || fetch(req)));
    return;
  }

  // Network-first for CDNs
  if (isCDN) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CDN_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Cache-first for local assets, update cache on success
  event.respondWith(
    caches.match(req).then(r => r || fetch(req).then(net => {
      return caches.open(CACHE).then(c => { c.put(req, net.clone()); return net; });
    }))
  );
});
