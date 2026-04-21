import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const { user } = JSON.parse(event.body || '{}');

  // When a user confirms email, we flip the 'is_verified' switch in Neon
  const response = await fetch(`${process.env.DATABASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "UPDATE profiles SET is_verified = TRUE WHERE id = $1",
      params: [user.id]
    })
  });

  if (!response.ok) {
    return { statusCode: 500, body: "Database sync failed" };
  }

  return { statusCode: 200, body: "User Verified" };
};

