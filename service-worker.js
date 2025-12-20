/* TeacherPanama Pro Service Worker */
const CACHE = 'tp-shell-v1';
const CDN_CACHE = 'tp-cdn-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(![CACHE, CDN_CACHE].includes(k)) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCDN = /unpkg\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host);

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(r => r || fetch(req))
    );
    return;
  }

  if (isCDN) {
    // network-first for CDNs
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

  // cache-first for local assets
  event.respondWith(
    caches.match(req).then(r => r || fetch(req).then(net => {
      return caches.open(CACHE).then(c => { c.put(req, net.clone()); return net; });
    }))
  );
});
