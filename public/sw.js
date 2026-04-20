self.addEventListener('install', (event) => {
  console.log('HabaHaba Service Worker Installed');
});

// Logic for background mining tasks goes here
self.addEventListener('fetch', (event) => {
  // Handles offline caching for rural areas
});
const CACHE_NAME = 'habacoin-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// BACKGROUND SYNC: The "Village-to-Global" Bridge
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-haba-rewards') {
        event.waitUntil(uploadPendingHustle());
    }
});

async function uploadPendingHustle() {
    // 1. Retrieve mined results from IndexedDB (offline storage)
  self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'haba-payout-sync') {
    event.waitUntil(processMinedHaba());
  }
});

async function processMinedHaba() {
  // Logic to call your /api/mine edge function
  // It sends the 'accumulated' hashes from IndexedDB to Neon DB
  console.log("HabaCoin: Running periodic background reward sync...");
}
  
    // 2. POST to your Neon DB API route
    console.log("HabaCoin: Syncing background mining results to Neon DB...");
}

// OFFLINE COMPATIBILITY: Cache the app for rural areas
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

