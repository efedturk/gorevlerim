const cacheName = "gorevlerim-v2";
const files = ["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest"];
self.addEventListener("install", event => event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(response => response || fetch(event.request))));
