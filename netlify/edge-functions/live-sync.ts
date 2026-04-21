import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  // Use the Netlify User ID as the source of truth
  const user = context.app.identity?.user;
  
  if (!user) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial check
      controller.enqueue(encoder.encode(`data: {"status": "Syncing for ${user.id}"}\n\n`));

      // This is where you connect to the Neon NOTIFY stream
      // Every time HABA is mined, this stream pushes the NEW balance to the UI
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
};

