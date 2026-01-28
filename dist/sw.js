// Service Worker for TradeXion PWA
// Version: 1.1.0
// IMPORTANT: Avoid caching HTML app-shell aggressively. If a dev build (Vite/HMR)
// ever gets cached as HTML, users can get stuck in reload loops until they clear site data.
const CACHE_NAME = 'tradexion-v2';
const RUNTIME_CACHE = 'tradexion-runtime-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/fav.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting()) // Activate immediately
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim()) // Take control of all pages immediately
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Never cache Vite dev / HMR artifacts (safety)
  if (url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/src/')) {
    return;
  }

  // Skip API calls and external resources
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname !== self.location.hostname ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'moz-extension:'
  ) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      // Network-first for HTML so users always get the latest shell
      fetch(request)
        .then((networkResponse) => {
          // Only cache successful HTML responses
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: best-effort cached page
          const cached = await caches.match(request);
          if (cached) return cached;
          // As a last resort, try root document if it was cached previously
          return (await caches.match('/')) || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Handle static assets (JS, CSS, images, etc.)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return a placeholder for failed image requests
            if (request.destination === 'image') {
              return new Response('', { status: 404 });
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
