const CACHE_NAME = 'kampus-patileri-v7.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
  './icon-logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni versiyonu beklemeden hemen kur
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Eski Önbellekleri Temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim()) // Kontrolü anında ele al
  );
});

// NETWORK FIRST (Önce İnternet, Çalışmazsa Önbellek)
self.addEventListener('fetch', event => {
  const request = event.request;

  // Yalnızca http(s) GET istekleri önbelleğe alınabilir
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Tam (200) veya opak (CDN/görsel) yanıtları sakla; 206 vb. saklanamaz
        if (response && (response.status === 200 || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        // İnternet yoksa önbellekten sun (?v=... sorgu parametresini yok say)
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const page = await caches.match('./index.html');
          if (page) return page;
        }
        return Response.error();
      })
  );
});
