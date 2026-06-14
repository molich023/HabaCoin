import { Context } from "https://edge.netlify.com";

// Live Coingecko / Matrix API feeds for price calculation
const ORACLE_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin,ethereum,tether&vs_currencies=usd";

export default async function handler(request: Request, context: Context) {
  // Only allow GET requests for reading token prices
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. Fetch live institutional asset pricing values
    const response = await fetch(ORACLE_API_URL);
    if (!response.ok) throw new Error("Failed to pull market price data feeds.");
    
    const data = await response.json();

    const btcPriceInUsdt = data["wrapped-bitcoin"].usd;
    const ethPriceInUsdt = data["ethereum"].usd;
    const usdtPriceInUsdt = data["tether"].usd; // Peg confirmation (~1.00)
    
    // Hardcoded baseline variable valuation for the 10% Renewable Energy Reserve asset
    const renewableAssetPriceInUsdt = 1.25; 

    /* 
       COMPUTING THE INDEX VALUE ARCHITECTURE:
       Applying your exact strategic asset weights:
       - 50% Wrapped Bitcoin
       - 25% Wrapped Ethereum
       - 15% Tether (USDT)
       - 10% Natural Renewable Energy Reserves
    */
    const calculatedBasketValue = 
      (btcPriceInUsdt * 0.50) + 
      (ethPriceInUsdt * 0.25) + 
      (usdtPriceInUsdt * 0.15) + 
      (renewableAssetPriceInUsdt * 0.10);

    // Constant scaling factor to map token pool ratio values against supply
    const HABA_SUPPLY_SCALING_FACTOR = 1000000; 
    const habaPriceInUsdt = calculatedBasketValue / HABA_SUPPLY_SCALING_FACTOR;

    return new Response(
      JSON.stringify({
        success: true,
        symbol: "HABA",
        currency_denominator: "USDT",
        price_usdt: habaPriceInUsdt.toFixed(6),
        basket_backing_breakdown: {
          wbtc_weight: "50%",
          weth_weight: "25%",
          usdt_weight: "15%",
          renewable_energy_weight: "10%"
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30" // Edge cached for 30s to mitigate API rate caps
        }
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, reason: "Unable to calculate index balance pricing layers." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Configures the Netlify Edge Engine to map this function to the correct endpoint path
export const config = { path: "/api/v1/token/price" };
