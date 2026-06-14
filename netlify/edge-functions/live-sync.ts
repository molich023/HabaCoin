
import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "live-sync: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const user = context.app?.identity?.user;
  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized session authorization" }), { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Establish an immediate heartbeat push upon initialization
      controller.enqueue(encoder.encode(`event: session_init\ndata: {"status": "Syncing ledger for user", "userId": "${user.id}"}\n\n`));

      /* Architectural Node: At the serverless edge, instead of pinning open stateful database sockets,
         the PWA registers this listener channel to keep UI balances in sync via micro-polling streams.
      */
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: {"timestamp": "${new Date().toISOString()}"}\n\n`));
        } catch {
          clearInterval(intervalId);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Disables proxy buffering layers on Deno/Netlify deployment routes
    }
  });
};

export const config = { path: "/api/v1/user/live-sync" };

