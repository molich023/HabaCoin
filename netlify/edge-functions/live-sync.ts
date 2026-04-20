export default async (request: Request) => {
  const stream = new ReadableStream({
    start(controller) {
      // Logic to subscribe to Neon DB's "NOTIFY" channel
      // Every time SQL runs an update, we push the new JSON to the controller
      const encoder = new TextEncoder();
      
      // Keep-alive heartbeat every 15 seconds
      setInterval(() => {
        controller.enqueue(encoder.encode("data: {\"heartbeat\": true}\n\n"));
      }, 15000);
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
  });
};
