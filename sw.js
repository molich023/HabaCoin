self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mining') {
    event.waitUntil(syncMinedHaba());
  }
});

async function syncMinedHaba() {
  console.log("HabaCoin: Background sync active...");
  // Logic to push results to /api/mine
}
