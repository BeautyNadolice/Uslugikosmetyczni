const CACHE_NAME = 'daria-index-v21-72-config-source-fix';
const CORE = [
  "./",
  "./index.html",
  "./style.css?v=22.18",
  "./index-desktop.css?v=21.71",
  "./index-mobile.css?v=21.71",
  "./booking.js?v=21.24",
  "./manifest.webmanifest?v=21.26",
  "./favicon.ico",
  "./logo-main-transparent-v2123.png",
  "./salon-scene-v2118-4k.webp",
  "./card-bg-v2123-hq.png",
  "./favicon-sd-light.png",
  "./favicon-sd-dark.png",
  "./icons/app-192.png",
  "./icons/app-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/admin/")) return;

  /* V21.72: page-design-config.js is the physical source of truth.
     Never serve a stale cached copy after DEV Editor writes the file. */
  if (url.pathname.endsWith("/page-design-config.js")) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
  );
});
