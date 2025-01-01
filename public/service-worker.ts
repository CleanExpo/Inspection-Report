/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Take control immediately
clientsClaim();

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache page navigations
registerRoute(
  // Check if request is for a page navigation
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Cache static assets
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Background sync for offline mutations
const bgSyncPlugin = new BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (specified in minutes)
});

// Register route for offline mutations
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') && 
    (url.pathname.includes('/update') || url.pathname.includes('/create')),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Listen for sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'offlineQueue') {
    event.waitUntil(syncOfflineData());
  }
});

// Handle offline data synchronization
async function syncOfflineData() {
  try {
    const offlineData = await getOfflineData();
    for (const item of offlineData) {
      await syncItem(item);
    }
    await clearOfflineData();
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Custom cache management
const CACHE_VERSION = 'v1';
const CURRENT_CACHES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  offline: `offline-${CACHE_VERSION}`,
};

// Cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CURRENT_CACHES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clear expired items
      clearExpiredItems(),
    ])
  );
});

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// Utility functions
async function getOfflineData() {
  const db = await openDB();
  return db.getAll('offlineStore');
}

async function clearOfflineData() {
  const db = await openDB();
  return db.clear('offlineStore');
}

async function syncItem(item: any) {
  try {
    const response = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: item.body,
    });
    return response.ok;
  } catch (error) {
    console.error('Error syncing item:', error);
    return false;
  }
}

async function clearExpiredItems() {
  const db = await openDB();
  const now = Date.now();
  const items = await db.getAll('offlineStore');
  
  for (const item of items) {
    if (item.timestamp + (24 * 60 * 60 * 1000) < now) {
      await db.delete('offlineStore', item.id);
    }
  }
}

// IndexedDB setup
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineStore')) {
        db.createObjectStore('offlineStore', { keyPath: 'id' });
      }
    };
  });
}

// Export type definitions
export {};
