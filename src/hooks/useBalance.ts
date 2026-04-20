import { useEffect, useState } from 'react';

export function useLiveMetrics(userId: string) {
  const [metrics, setMetrics] = useState({ coins: 0, karma: 0, points: 0 });

  useEffect(() => {
    // 1. Establish a Server-Sent Events (SSE) connection to our Netlify Function
    const eventSource = new EventSource(`/api/live-sync?userId=${userId}`);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setMetrics(prev => ({ ...prev, ...newData }));
      console.log("HabaCoin: Live Metrics Synced!");
    };

    return () => eventSource.close();
  }, [userId]);

  return metrics;
}
