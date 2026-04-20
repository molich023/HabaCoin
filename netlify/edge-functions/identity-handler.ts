import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const event = request.headers.get("X-Netlify-Event");
  const { user } = await request.json();

  switch (event) {
    case "signup":
      // VALIDATE: Check if email is from a banned domain
      if (user.email.endsWith("tempmail.com")) {
         return new Response("Banned domain", { status: 403 });
      }
      // Logic: Create a new row in Neon 'profiles' table with 0 Karma
      break;

    case "login":
      // SIGN-UP/LOGIN: Log the timestamp in Neon to track active miners
      console.log(`Hustle Active: ${user.email} logged in.`);
      break;

    case "user_updated":
      // MODIFICATIONS: Update Karma or Wallet Address in Neon
      break;

    default:
      return new Response("Event Ignored", { status: 200 });
  }

  return new Response("OK", { status: 200 });
};
