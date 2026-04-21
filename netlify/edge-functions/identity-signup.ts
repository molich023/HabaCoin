import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const { user } = await request.json();
  
  // Netlify automatically provides the country of the user in the 'geo' object
  const country = context.geo?.country?.name || "Unknown";
  
  // Map country to Continent for our Leaderboard
  const region = mapCountryToContinent(country);

  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  await fetch(`${DATABASE_URL}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "UPDATE profiles SET region = $1 WHERE id = $2",
      params: [region, user.id]
    })
  });

  return new Response("Region Sync Complete", { status: 200 });
};

// Helper to keep the "Global Hustle" organized
function mapCountryToContinent(country: string): string {
    const mapping: Record<string, string> = {
        'United States': 'North America',
        'Nigeria': 'Africa',
        'India': 'Asia-Pacific',
        'Brazil': 'Latin America',
        'Germany': 'Europe'
        // Add more common ones here
    };
    return mapping[country] || 'Other';
}
