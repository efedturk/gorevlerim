const cacheName = "gorevlerim-v3";
const files = ["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name !== cacheName).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(cacheName).then(cache => cache.put("./", copy));
          return response;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
