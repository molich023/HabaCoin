import { Context } from "@netlify/edge-functions";

// The "Default Export" is mandatory for Edge Functions
export default async (request: Request, context: Context) => {
  try {
  const { reward } = await request.json();
  const user = context.app.identity?.user;

  if (!user) return new Response("Unauthorized", { status: 401 });

  // Update Neon DB using the RLS-protected Data API
  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  await fetch(`${DATABASE_URL}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "UPDATE profiles SET balance = balance + $1 WHERE id = $2",
      params: [reward, user.id]
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
