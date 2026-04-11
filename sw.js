/**
 * Service Worker — Portfolio PWA
 * Dynamic Asset Versioning Strategy
 */

const SW_VERSION = '1.0.2';
const CACHE_NAME = `portfolio-cache-v${SW_VERSION}`;

const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/premium-enhancements.css',
  './css/contact.css',
  './css/styleSwitcher.css',
  './js/script.js',
  './js/styleSwitcher.js',
  './manifest.json',
  './images/icon.png'
];

// Install event: Cache essential files and SKIP WAITING
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Pre-caching version', SW_VERSION);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force activation immediately
  );
});

// Activate event: Clean up old caches and CLAIM CLIENTS
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Purging old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Taking control of all clients');
      return self.clients.claim(); // Take control of all open tabs
    })
  );
});

// Fetch event: Network-first with cache fallback and dynamic versioning
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocalAsset = url.origin === self.location.origin && 
                       (url.pathname.includes('/css/') || 
                        url.pathname.includes('/js/') || 
                        url.pathname.includes('/images/') ||
                        url.pathname.endsWith('manifest.json'));

  // Automatically append version to local assets if not already present
  let requestToProcess = event.request;
  if (isLocalAsset && !url.searchParams.has('v')) {
    url.searchParams.set('v', SW_VERSION);
    requestToProcess = new Request(url.toString(), event.request);
  }

  event.respondWith(
    fetch(requestToProcess)
      .then(response => {
        // If valid response from network, update cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(requestToProcess, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (try versioned then clean)
        return caches.match(requestToProcess)
          .then(matched => matched || caches.match(event.request));
      })
  );
});
