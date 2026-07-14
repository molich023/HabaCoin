<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';

  let map;
  let mapContainer;
  let polyline;
  
  let isTracking = false;
  let watchId = null;
  let walkPath = []; // Array of { lat, lng, timestamp }
  let startTimestamp = null;
  let currentDistance = 0; // in km

  // Setup contract details
  const contractAddress = "YOUR_DEPLOYED_PROXY_ADDRESS_HERE";
  const abi = [
    "function claimWalkReward(address user, uint256 kilometers, uint256 tokenAmount, bytes32 sessionId, bytes calldata signature) external"
  ];

  onMount(async () => {
    const L = await import('leaflet');
    import('leaflet/dist/leaflet.css');

    // Nairobi Default
    map = L.map(mapContainer).setView([-1.2921, 36.8219], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    polyline = L.polyline([], { color: '#00d084', weight: 5 }).addTo(map);
  });

  function startTracking() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    isTracking = true;
    walkPath = [];
    currentDistance = 0;
    startTimestamp = Date.now();

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };

        // Append point to walk state
        walkPath = [...walkPath, newPoint];

        // Update map rendering
        const L = window.L || { latLng: (lat, lng) => [lat, lng] };
        polyline.addLatLng([latitude, longitude]);
        map.setView([latitude, longitude], 16);

        // Calculate dynamic live distance
        if (walkPath.length > 1) {
          const p1 = walkPath[walkPath.length - 2];
          const p2 = newPoint;
          currentDistance += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  function stopTracking() {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    isTracking = false;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async function processAndClaim() {
    stopTracking();

    if (walkPath.length < 2) {
      alert("Not enough walk points captured!");
      return;
    }

    try {
      // 1. Get User wallet address from Metamask/Coinbase Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const sessionId = ethers.hexlify(ethers.randomBytes(32));

      // 2. Query our anti-cheat backend endpoint
      const response = await fetch('http://localhost:5000/api/verify-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          coordinates: walkPath,
          startTimestamp,
          endTimestamp: Date.now(),
          sessionId
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(`Anti-Cheat Flagged: ${data.error}`);
        return;
      }

      // 3. Send transaction to UUPS contract using verified cryptographic signature
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const kmScaled = Math.round(parseFloat(data.kilometers) * 100);

      alert(`Verification Approved! claiming: ${data.kilometers} KM worth of HABA...`);
      
      const tx = await contract.claimWalkReward(
        userAddress,
        kmScaled,
        data.tokenAmount,
        data.sessionId,
        data.signature
      );

      await tx.wait();
      alert(`🎉 Success! Haba account updated! Transferred: ${parseFloat(ethers.formatUnits(data.tokenAmount, 18))} HABA`);
      
      // Clean path
      walkPath = [];
      polyline.setLatLngs([]);
    } catch (err) {
      console.error(err);
      alert("Execution failed. Check terminal/console logs.");
    }
  }
</script>

<div class="m2e-container">
  <div class="stats-panel">
    <h3>🏃 HABA Move-to-Earn (Proof of Walk)</h3>
    <div class="metric">Distance: <strong>{currentDistance.toFixed(3)} KM</strong></div>
    <div class="buttons">
      {#if !isTracking}
        <button class="btn start" on:click={startTracking}>Start Tracking Walk</button>
      {:else}
        <button class="btn stop" on:click={stopTracking}>Pause Tracking</button>
      {/if}
      <button class="btn claim" on:click={processAndClaim} disabled={walkPath.length === 0}>Claim Tokens</button>
    </div>
  </div>
  <div bind:this={mapContainer} class="map-element"></div>
</div>

<style>
  .m2e-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    background: #161b22;
    border-radius: 8px;
    border: 1px solid #30363d;
  }
  .stats-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #f0f6fc;
  }
  .metric {
    font-size: 1.25rem;
    color: #00d084;
  }
  .buttons {
    display: flex;
    gap: 10px;
  }
  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    color: #fff;
  }
  .start { background: #238636; }
  .stop { background: #da3633; }
  .claim { background: #00d084; color: #161b22; }
  .map-element {
    height: 380px;
    width: 100%;
    border-radius: 6px;
  }
</style>
