import { useEffect, useState } from 'react';

export function useHotspotTracker(userLocation: [number, number] | null) {
  const [activeMultiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    if (!userLocation || userLocation[0] === 0) return;

    const verifyGeofencedHotspot = async () => {
      try {
        const response = await fetch(`/api/check-hotspot?lat=${userLocation[0]}&lng=${userLocation[1]}`);
        if (!response.ok) throw new Error("Network hotspot check connection timed out.");
        
        const data = await response.json();
        
        if (data.inHotspot) {
          setMultiplier(data.multiplier);
          document.body.classList.add('glow-green-geozone');
        } else {
          setMultiplier(1.0);
          document.body.classList.remove('glow-green-geozone');
        }
      } catch (err) {
        console.error("Failed executing structural location check verification loops:", err);
      }
    };
    
    verifyGeofencedHotspot();
  }, [userLocation]);

  return activeMultiplier;
}
