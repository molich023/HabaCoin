import { useEffect, useState } from 'react';

interface LiveMetrics {
  ubuntuBalance: number;
  activeStakes: number;
  fiatExchangeRate: number;
}

export function useLiveMetrics(userId: string) {
  const [metrics, setMetrics] = useState<LiveMetrics>({ 
    ubuntuBalance: 0.0, 
    activeStakes: 0, 
    fiatExchangeRate: 0.0 
  });

  useEffect(() => {
    if (!userId) return;

    // Open a protected stream connecting back to our server-side database proxy layer
    const eventSource = new EventSource(`/api/live-sync?userId=${encodeURIComponent(userId)}`);

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setMetrics(prev => ({
          ...prev,
          ubuntuBalance: newData.ubuntuBalance ?? prev.ubuntuBalance,
          activeStakes: newData.activeStakes ?? prev.activeStakes,
          fiatExchangeRate: newData.fiatExchangeRate ?? prev.fiatExchangeRate
        }));
        console.log("[+] HabaCoin State: Client infrastructure synchronization verified.");
      } catch (err) {
        console.error("Error parsing metrics payload step data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Metrics SSE tracking stream experienced a connection failure:", err);
      eventSource.close();
    };

    // Teardown the streaming listener context when moving across application pages
    return () => {
      eventSource.close();
    };
  }, [userId]);

  return metrics;
}
