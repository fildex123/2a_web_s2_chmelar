self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('ninja-v1').then(cache => cache.addAll([
      '/', '/play.html', '/play.css', '/play.js', '/entities.js'
    ]))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});