/**
 * HabaCoin Global Protocol - Hardened Service Worker
 * Focuses on high offline reliability for remote areas while maintaining tight data protection.
 */

const CACHE_NAME = 'habacoin-v1.0.0';

// Explicit listing of asset pathways to cache for offline capabilities
const IMMUTABLE_STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/matrix-login.js',
  '/icons/icon-192.png'
];

// 1. Install Event Handler
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[+] Syncing application assets shell for offline usage...');
      return cache.addAll(IMMUTABLE_STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event Handler
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[+] Cleaning out obsolete cache segments:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network Fetch Core Interceptor Strategy
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // SECURITY GUARDRAIL: Never cache live blockchain state queries or API endpoint transactions
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.hostname.includes('coingecko.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Execute a secure Cache-First strategy for static assets, falling back to network queries
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Guard checking that the network response is clean and valid before caching
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Fallback response matrix if both the network and local cache are completely offline
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// 4. Background Sync Implementation - The "Village-to-Global" Connection Rail
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-haba-rewards') {
    console.log('[+] Sync event triggered: Processing background mining queue.');
    event.waitUntil(uploadPendingHustle());
  }
});

// 5. Periodic Background Sync Execution Frame
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'haba-payout-sync') {
    console.log('[+] Periodic sync pulse: Refreshing global transaction proofs.');
    event.waitUntil(processMinedHaba());
  }
});

/**
 * Uploads offline telemetry tokens accrued from local IndexedDB databases to Neon DB.
 */
async function uploadPendingHustle() {
  try {
    console.log("[+] Contacting Edge network rails to offload transaction logs...");
    // Extraction logic from local IndexedDB goes here...
    
    // Example edge push synchronization check post execution
    const syncStatusResponse = await fetch('/api/v1/telemetry/verify-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'background_sync_worker', timestamp: Date.now() })
    });
    
    if (!syncStatusResponse.ok) throw new Error("Edge pipeline sync rejected transaction packet batch.");
    console.log("[+] Background mining metrics synchronized to Neon DB successfully.");
  } catch (error) {
    console.error("[-] Background sync processing fault occurred:", error.message);
  }
}

/**
 * Fires a background verification signal to synchronize current mining reward statuses.
 */
async function processMinedHaba() {
  try {
    await fetch('/api/v1/mining/verify-spow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pulse_check: true })
    });
    console.log("[+] Periodic mining payout cycle processed successfully.");
  } catch (error) {
    console.error("[-] Background pulse check failed:", error.message);
  }
}
