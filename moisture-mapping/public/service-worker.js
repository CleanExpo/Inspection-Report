const CACHE_NAME = 'moisture-mapping-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        // For API requests, try the network first, then the cache
        if (event.request.url.includes('/api/')) {
          return fetch(fetchRequest)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }

              // Clone the response because it's a stream and can only be consumed once
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // If network fails, try to return from cache
              return caches.match(event.request);
            });
        }

        // For non-API requests, try the cache first, then the network
        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle offline data synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'sync-moisture-readings') {
    event.waitUntil(syncMoistureReadings());
  }
});

// Function to sync moisture readings when back online
async function syncMoistureReadings() {
  try {
    const db = await openIndexedDB();
    const pendingReadings = await db.getAll('pendingReadings');
    
    for (const reading of pendingReadings) {
      try {
        const response = await fetch('/api/moisture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reading),
        });

        if (response.ok) {
          await db.delete('pendingReadings', reading.id);
        }
      } catch (error) {
        console.error('Error syncing reading:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncMoistureReadings:', error);
  }
}

// IndexedDB setup for offline data storage
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MoistureMappingDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store for pending readings
      if (!db.objectStoreNames.contains('pendingReadings')) {
        db.createObjectStore('pendingReadings', { keyPath: 'id' });
      }

      // Create object store for cached readings
      if (!db.objectStoreNames.contains('readings')) {
        db.createObjectStore('readings', { keyPath: 'id' });
      }
    };
  });
}

// Periodic sync for background updates (if supported)
if ('periodicSync' in self.registration) {
  self.registration.periodicSync.register('sync-moisture-readings', {
    minInterval: 24 * 60 * 60 * 1000 // 24 hours
  }).catch(error => {
    console.error('Error registering periodic sync:', error);
  });
}
