import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  // 1. PUBLIC DATA (CoinGecko - Free)
  const btcRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const { bitcoin } = await btcRes.json();

  // 2. SECRET DATA (Twelve Data - Free Tier)
  // We fetch Gold (XAU) and Silver (XAG) here. 
  // Uranium is kept as a 'Static Constant' to save API credits.
  const TD_KEY = Deno.env.get("TWELVE_DATA_KEY");
  const metalsRes = await fetch(`https://api.twelvedata.com/price?symbol=XAU/USD,XAG/USD&apikey=${TD_KEY}`);
  const metals = await metalsRes.json();

  // 3. THE PRIVATE FORMULA (The "Secret")
  const goldPrice = parseFloat(metals["XAU/USD"].price);
  const silverPrice = parseFloat(metals["XAG/USD"].price);
  const uraniumConstant = 105.00; // Fixed price for zero-cost stability

  // Calculate the "Haba Strength Index"
  // Weights: 40% BTC, 30% Gold, 20% Uranium, 10% Silver
  const habaStrength = (bitcoin.usd * 0.4) + (goldPrice * 0.3) + (uraniumConstant * 0.2) + (silverPrice * 0.1);

  // 4. THE CURRENCY CONVERTER (Zero Cost)
  // Detect user country and convert the HABA value to their local currency
  const userCurrency = context.geo?.currency || "USD";
  const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
  const rates = await rateRes.json();
  const localValue = habaStrength * (rates.rates[userCurrency] || 1);

  return new Response(JSON.stringify({
    haba_usd: habaStrength.toFixed(4),
    local_currency: userCurrency,
    local_value: localValue.toFixed(2),
    market_status: "Energy-Backed & Secure"
  }), {
    headers: { "Content-Type": "application/json" }
  });
};
