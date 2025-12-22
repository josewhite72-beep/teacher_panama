/* TeacherPanama Pro Service Worker - OFFLINE FIRST */
const CACHE_VERSION = 'tp-pro-v3';
const CACHE_NAME = `${CACHE_VERSION}-shell`;
const CDN_CACHE_NAME = `${CACHE_VERSION}-cdn`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
  'https://unpkg.com/xlsx/dist/xlsx.full.min.js',
  'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://unpkg.com/jspdf-autotable@3.5.28/dist/jspdf.plugin.autotable.min.js'
];

// Instalación - Cachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cachear shell
      caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Cacheando shell assets...');
        return cache.addAll(SHELL_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      }),
      
      // Cachear CDN
      caches.open(CDN_CACHE_NAME).then(cache => {
        console.log('[Service Worker] Cacheando CDN assets...');
        const cdnRequests = CDN_ASSETS.map(url => {
          return new Request(url, { 
            mode: 'cors',
            credentials: 'omit'
          });
        });
        return Promise.all(
          cdnRequests.map(request => 
            cache.add(request).catch(err => 
              console.warn(`[Service Worker] No se pudo cachear: ${request.url}`, err)
            )
          )
        );
      })
    ]).then(() => {
      console.log('[Service Worker] Instalación completada');
      return self.skipWaiting();
    })
  );
});

// Activación - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar caches que no sean los actuales
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activación completada');
      return self.clients.claim();
    })
  );
});

// Estrategia de cache: Cache First con fallback a network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Solo manejar solicitudes GET
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  // Estrategia para navegación: servir index.html desde cache
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(response => {
        return response || fetch(request);
      })
    );
    return;
  }
  
  // Determinar si es un recurso local o CDN
  const isLocal = url.origin === self.location.origin;
  const isCDN = CDN_ASSETS.some(cdnUrl => url.href.startsWith(cdnUrl)) || 
                url.host.includes('unpkg.com') || 
                url.host.includes('cdn.tailwindcss.com') ||
                url.host.includes('fonts.googleapis.com') ||
                url.host.includes('fonts.gstatic.com');
  
  // Estrategia: Cache First para todo
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Si está en cache, devolverlo
      if (cachedResponse) {
        console.log(`[Service Worker] Sirviendo desde cache: ${url.pathname}`);
        return cachedResponse;
      }
      
      // Si no está en cache, hacer fetch
      return fetch(request).then(networkResponse => {
        // Si la respuesta es válida, cachearla
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          
          // Determinar en qué cache guardar
          const cacheName = isLocal ? CACHE_NAME : CDN_CACHE_NAME;
          
          caches.open(cacheName).then(cache => {
            console.log(`[Service Worker] Cacheando: ${url.pathname}`);
            cache.put(request, responseToCache);
          });
        }
        
        return networkResponse;
      }).catch(error => {
        console.error(`[Service Worker] Fetch falló para: ${url.href}`, error);
        
        // Si es un recurso local y falla, intentar servir una página de error genérica
        if (isLocal && request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        
        // Para otros recursos, devolver error
        return new Response('Recurso no disponible offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});