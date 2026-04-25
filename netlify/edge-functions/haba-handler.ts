import { Context } from "@netlify/edge-functions";

// The "Default Export" is mandatory for Edge Functions
export default async (request: Request, context: Context) => {
  try {
  
  // Check if user is logged in via Netlify Identity
  const user = context.app.identity?.user;

  if (url.pathname === "/api/profile" && user) {
    const neon_url = Deno.env.get("DATABASE_URL");
    
    // Logic to UPSERT user into Neon DB
    // This creates the user in Neon the moment they sign up on Netlify
    return new Response(JSON.stringify({ 
      msg: "Welcome to HabaCoin", 
      userId: user.id 
    }), { status: 200 });
  }

  return context.next();
};
