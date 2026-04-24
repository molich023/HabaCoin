import { useEffect, useState } from 'react';

export function useHotspotTracker(userLocation: [number, number]) {
  const [activeMultiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    // Logic: If user is inside the 'Green Zone' coordinates, 
    // we instantly update the local state to trigger the UI "Jump"
    const checkHotspot = async () => {
      const response = await fetch(`/api/check-hotspot?lat=${userLocation[0]}&lng=${userLocation[1]}`);
      const data = await response.json();
      
      if (data.inHotspot) {
        setMultiplier(data.multiplier);
        // Trigger a 'Monstrous' UI animation here
        document.body.classList.add('glow-green');
      }
    };
    
    checkHotspot();
  }, [userLocation]);

  return activeMultiplier;
}
