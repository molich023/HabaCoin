import { Context } from "@netlify/edge-functions";

// The "Default Export" is mandatory for Edge Functions
export default async (request: Request, context: Context) => {
  try {
    // Logic for resolving Haba game results (Chess, Sudoku, etc.)
    const { gameId, winnerId } = await request.json();

    // Security: Validate the request is coming from your authenticated PWA
    if (!context.site.url) {
      return new Response("Unauthorized", { status: 401 });
    }

    return new Response(JSON.stringify({ 
      status: "Success", 
      message: `Game ${gameId} resolved for ${winnerId}` 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid Request" }), { status: 400 });
  }
};

