const CACHE_NAME = "jesusinho-cache-v1";
const urlsToCache = [
  ".",
  "index.html",
  "style.css",
  "script.js",
  "jesusinho.gif",
  "manifest.json"
  // adicione outros arquivos que quiser cachear (ícones, áudio, etc)
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
