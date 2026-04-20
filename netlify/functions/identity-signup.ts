export const handler = async (event: any) => {
  const { user } = JSON.parse(event.body);

  // Auto-verify the user in Neon DB once they confirm email
  await fetch(`${process.env.DATABASE_URL}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "UPDATE profiles SET is_verified = TRUE WHERE id = $1",
      params: [user.id]
    })
  });

  return { statusCode: 200 };
};
