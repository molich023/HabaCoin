export default async () => {
  // Fetch rates for our top 5 global hustle regions
  const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=YOUR_KEY&currencies=NGN,INR,BRL,EUR,ZAR`);
  const { data } = await res.json();

  // Store these in Neon so the frontend doesn't have to call the API 1,000 times
  // This keeps us under the "Free Tier" limit forever.
};
