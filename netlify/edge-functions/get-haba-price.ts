import { Context } from "https://edge.netlify.com";

// Updated Oracle API to fetch WBTC, ETH, USDT, and a live ReFi asset index (Klima/Carbon)
const ORACLE_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin,ethereum,tether,klima-dao&vs_currencies=usd";

export default async function handler(request: Request, context: Context) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const response = await fetch(ORACLE_API_URL);
    if (!response.ok) throw new Error("Failed to pull real-time market oracle feeds.");
    
    const data = await response.json();

    const btcPrice = data["wrapped-bitcoin"].usd;
    const ethPrice = data["ethereum"].usd;
    const usdtPrice = data["tether"].usd;
    const refiGreenPrice = data["klima-dao"].usd; // Live, crypto-native 10% Renewable/Green asset asset

    /* THE MULTI-ASSET INDEX MATRICES:
       - 50% Wrapped Bitcoin (WBTC)
       - 25% Wrapped Ethereum (WETH)
       - 15% Tether (USDT)
       - 10% Decentralized Renewable/Green Asset (ReFi)
    */
    const aggregateBasketValue = 
      (btcPrice * 0.50) + 
      (ethPrice * 0.25) + 
      (usdtPrice * 0.15) + 
      (refiGreenPrice * 0.10);

    // Divisor map based on your 100 Billion fixed token distribution metrics
    const HABA_POOL_DENOMINATOR = 1000000; 
    const finalHabaValueInUsdt = aggregateBasketValue / HABA_POOL_DENOMINATOR;

    return new Response(
      JSON.stringify({
        success: true,
        symbol: "HABA",
        pegged_to: "USDT_BASKET_INDEX",
        price_usdt: finalHabaValueInUsdt.toFixed(6),
        underlying_market_rates: {
          bitcoin: btcPrice,
          ethereum: ethPrice,
          tether: usdtPrice,
          renewable_refi: refiGreenPrice
        },
        allocation_ratios: "50% WBTC / 25% WETH / 15% USDT / 10% REFI",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=15" // Dynamic edge cache matching high-frequency updates
        }
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, reason: "Oracle price aggregation timeout." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = { path: "/api/v1/token/price" };
