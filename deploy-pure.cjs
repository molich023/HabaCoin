require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function main() {
    const rpcUrl = process.env.POLYGON_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
        console.error("❌ Deployment halted: Missing POLYGON_RPC_URL or PRIVATE_KEY in your .env file.");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`🚀 Preparing deployment engine from account: ${wallet.address}`);

    const artifactPath = path.resolve(__dirname, 'artifacts', 'HabaCoin.json');
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifacts missing! Run 'node compile-pure.cjs' first.");
        process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    const HabaCoinFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    console.log("⏳ Sending deployment transaction...");
    
    const contract = await HabaCoinFactory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log("\n====================================================");
    console.log(`🎉 HabaCoin COMPLIANT ARTIFACT DEPLOYED!`);
    console.log(`📍 Contract Address: ${deployedAddress}`);
    console.log("====================================================\n");
}

main().catch((error) => {
    console.error("❌ Deployment failed with error:", error);
    process.exit(1);
});
