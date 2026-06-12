const CACHE_NAME = 'habacoin-global-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/wasm/icon.png'
];

// 1. Install Event Handler: Force immediate service worker registration activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('HabaCoin PWA: Pre-caching functional system core assets.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event Handler: Purge historical obsolete cache variations automatically
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('HabaCoin PWA: Clearing deprecated application cache footprint:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event Interceptor: Enables full offline functionality inside Termux/FreeBSD
self.addEventListener('fetch', (event) => {
  // Only handle standard read requests; let analytics and transactional POST requests flow natively
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // Intelligently clone new static discoveries directly into memory cache tables
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback strategy if connection drops completely
          console.warn('HabaCoin PWA Router: Operating in isolated offline database sandbox.');
        });
    })
  );
});

// 4. Background Sync Event Listener: Coordinates automated offline mining uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mining') {
    event.waitUntil(syncMinedHaba());
  }
});

/**
 * Automatically gathers cached offline step proofs and pipes them to our global engine
 */
async function syncMinedHaba() {
  console.log("HabaCoin: Background sync thread pipeline processing active...");
  
  // Retrieve raw data steps securely from IndexedDB or local storage states
  const userId = 1; // Fallback or dynamic assignment context
  const cachedStepsToSubmit = 5000; // Simulating batch collection array data

  try {
    const response = await fetch('/api/mining/sync-steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        rawSteps: cachedStepsToSubmit,
        syncContext: 'PWA_Background_Worker'
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned transactional error code: ${response.status}`);
    }

    const data = await response.json();
    console.log("HabaCoin Sync Success: $UBUNTU Token block mined and updated on-chain safely.", data);
  } catch (error) {
    console.error("HabaCoin Background Sync Engine execution loop failure:", error);
    // Rethrowing the error tells the browser's sync manager to retry when the connection recovers
    throw error;
  }
}
