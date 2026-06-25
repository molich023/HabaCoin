/**
 * Enforces that the user's mobile wallet is set to Polygon Mainnet (Chain ID 137 / 0x89)
 */
export async function enforcePolygonNetwork() {
    if (!window.ethereum) throw new Error("No Web3 provider discovered.");

    const TARGET_HEX_CHAIN = "0x89"; // Hexadecimal for 137 (Polygon PoS Mainnet)

    // 1. Execute the eth_chainId command you found in your dRPC panel
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (currentChainId !== TARGET_HEX_CHAIN) {
        console.log("⚠️ Incorrect network detected. Initiating automated chain switch...");
        try {
            // 2. Request the mobile user's wallet to hot-swap directly to Polygon
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TARGET_HEX_CHAIN }],
            });
        } catch (switchError) {
            // Error code 4902 indicates that the network is not yet added to the wallet
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: TARGET_HEX_CHAIN,
                        chainName: 'Polygon Mainnet',
                        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                        rpcUrls: ['https://polygon.drpc.org'],
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }]
                });
            } else {
                throw switchError;
            }
        }
    }
}
