async function testDRPCConnection() {
  const drpcUrl = "https://lb.drpc.live/polygon/YOUR_API_KEY"; // Replace with your real dRPC key

  try {
    const response = await fetch(drpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      })
    });

    const data = await response.json();
    if (data.result) {
      console.log("✅ Haba-Network Connected! Current Block:", parseInt(data.result, 16));
      return true;
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
    return false;
  }
}
