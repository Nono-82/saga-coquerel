const CACHE_NAME = 'coquerel-v30-final';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Installation : Mise en cache des fichiers
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Mise en cache des fichiers');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Suppression de l\'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes : Servir depuis le cache si hors ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si trouvé dans le cache, on le sert
      if (response) {
        return response;
      }
      // Sinon, on tente de le récupérer sur le réseau
      return fetch(event.request).catch(() => {
        // Si échec réseau (offline complet), on ne peut rien faire de plus pour une nouvelle requête
        console.log('[ServiceWorker] Pas de réseau et pas en cache pour : ', event.request.url);
      });
    })
  );
});