import dotenv from 'dotenv';
dotenv.config();

/**
 * Calculates the dynamic token valuation based on current Twelve Data prices and system weights
 */
export async function calculateTokenValue() {
    try {
        // 1. Parse the asset basket weights from your environment variable
        const weightsConfig = process.env.backing_weights_12data;
        if (!weightsConfig) throw new Error("Missing backing_weights_12data environment variable.");
        const weights = JSON.parse(weightsConfig);

        // 2. Extract the active tickers to build the Twelve Data API request URL
        const symbols = Object.keys(weights).join(',');
        const apiKey = process.env.TWELVE_DATA_API_KEY;
        
        if (!apiKey) {
            console.log("⚠️ Missing TWELVE_DATA_API_KEY. Using mock data for local testing...");
            return mockCalculatedValue(weights);
        }

        const url = `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${apiKey}`;
        const response = await fetch(url);
        const prices = await response.json();

        // 3. Compute the weighted total asset valuation
        let finalValue = 0;
        Object.entries(weights).forEach(([symbol, weight]) => {
            const currentPrice = parseFloat(prices[symbol]?.price || 0);
            finalValue += currentPrice * weight;
        });

        return finalValue;
    } catch (error) {
        console.error("❌ Valuation Engine error:", error.message);
        return 0;
    }
}

function mockCalculatedValue(weights) {
    // Isolated mock data for your local dev server running in Termux
    const mockPrices = { "USD": 1.00, "XAU": 2350.50, "BTC": 67000.00 };
    let finalValue = 0;
    Object.entries(weights).forEach(([symbol, weight]) => {
        finalValue += (mockPrices[symbol] || 0) * weight;
    });
    return finalValue;
}
