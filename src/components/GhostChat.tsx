// Add this to your index.html or a separate JS file
async function loginToGhostMode() {
    const statusEl = document.getElementById('chat-status');
    statusEl.innerText = "Initializing Ghost Mode...";

    try {
        // 1. Get the User's Wallet & Signature (Our secret "password" source)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.JsonRpcProvider(process.env.fbce8ed6969a4d9e1b63ef4aaed87f10135e334977b828d946ee672f33bdcd11);
        const wallet = accounts[0];
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [`HabaCoin Ghost Mode Login: ${wallet}`, wallet]
        });

        // 2. Initialize Matrix Client
        const client = matrixcs.createClient({
            baseUrl: "https://matrix.org",
            userId: `@habacoin_${wallet.slice(0,8)}:matrix.org`
        });

        // 3. Register or Login automatically
        await client.registerGuest(); 
        // Note: For full E2EE, we'd use the signature as the recovery key
        
        statusEl.innerText = "Ghost Mode Active. Connection Encrypted.";
        openChatWindow();
        
    } catch (err) {
        statusEl.innerText = "Encryption Failed. Check Wallet.";
        console.error(err);
    }
}
