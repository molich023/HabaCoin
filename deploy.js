import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configuration - Replace with your chosen testnet parameters
const RPC_URL = "https://rpc.ankr.com/eth_sepolia"; // Change this if you are using Base Sepolia, Amoy, etc.
const PRIVATE_KEY = "YOUR_TESTNET_PRIVATE_KEY_HERE"; 

async function main() {
    // Read the compiled binaries directly from the root
    const abiPath = path.resolve(__dirname, 'HabaCoin.abi');
    const binPath = path.resolve(__dirname, 'HabaCoin.bin');

    if (!fs.existsSync(abiPath) || !fs.existsSync(binPath)) {
        console.error("❌ Missing compilation artifacts! Run node compile.js first.");
        process.exit(1);
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const bytecode = fs.readFileSync(binPath, 'utf8').trim();

    // Connect to the EVM network provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    if (PRIVATE_KEY === "YOUR_TESTNET_PRIVATE_KEY_HERE") {
        console.error("❌ Please swap the placeholder with your actual private key inside deploy.js");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`📡 Deployer address initialized: ${wallet.address}`);
    
    const balance = await wallet.getBalance();
    console.log(`🪙 Deployer Balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.eq(0)) {
        console.error("❌ You need testnet gas tokens to deploy! Grab some from a faucet first.");
        process.exit(1);
    }

    console.log("⏳ Sending contract deployment transaction to the network...");

    // Instantiate a factory and execute deployment
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Pass constructor arguments inside deploy() if your HabaCoin constructor takes parameters
    const contract = await factory.deploy(); 
    
    console.log(`⛓️ Transaction hash broadcasted: ${contract.deployTransaction.hash}`);
    console.log("⏳ Awaiting block confirmation...");
    
    await contract.deployed();

    console.log("\n=======================================================");
    console.log(`🎉 HabaCoin Deployed Successfully!`);
    console.log(`📍 Contract Address: ${contract.address}`);
    console.log("=======================================================\n");
    console.log("👉 Copy this Contract Address and paste it into H_CONTRACT_ADDRESS inside src/HabaDashboard.svelte!");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
