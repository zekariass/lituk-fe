// const CACHE_NAME = 'habeshadrive-v1'
// const OFFLINE_URL = '/'

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
//   )
//   self.skipWaiting()
// })

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) =>
//       Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       )
//     )
//   )
//   self.clients.claim()
// })

// self.addEventListener('fetch', (event) => {
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request).catch(() => caches.match(OFFLINE_URL))
//     )
//     return
//   }
//   event.respondWith(
//     fetch(event.request).catch(() => caches.match(event.request))
//   )
// })



const CACHE_NAME = "habeshadrive-v2";
const OFFLINE_FALLBACK_PAGE = "/offline.html";

// Precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",               // homepage
        OFFLINE_FALLBACK_PAGE,
        "/icon-192.png",
        "/icon-512.png",
        "/apple-touch-icon.png"
      ]);
    })
  );
  self.skipWaiting();
});

// Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first for navigation (Next.js pages)
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_FALLBACK_PAGE))
    );
    return;
  }

  // Cache-first for static assets
  if (
    event.request.destination === "style" ||
    event.request.destination === "script" ||
    event.request.destination === "image"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
    return;
  }

  // Default: network fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
