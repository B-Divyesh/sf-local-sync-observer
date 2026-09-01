const CACHE = "local-sync-observer-site-v4";
const SHELL = ["/", "/demo/", "/demo.js", "/404.html", "/assets/convergence-board.webp", "/privacy/", "/terms/"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => { if (event.request.method === "GET" && new URL(event.request.url).origin === self.location.origin) event.respondWith(caches.match(event.request, { ignoreSearch: event.request.mode === "navigate" }).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }))); });
