import { ethers } from "hardhat";

async function main() {
  console.log("⚡ Starting Automated Gas Usage Analysis Baseline...");
  
  // Get signers
  const [deployer, recipient] = await ethers.getSigners();
  
  // Fetch factory artifact
  const HabaCoin = await ethers.getContractFactory("HabaCoinOptimized");
  
  // Estimate Deployment Gas
  const deployTx = await HabaCoin.getDeployTransaction(deployer.address);
  const estimatedDeployGas = await ethers.provider.estimateGas(deployTx);
  console.log(`\n📦 Estimated Deployment Cost: ${estimatedDeployGas.toString()} gas units`);
  
  // Deploy the contract instance
  const contract = await HabaCoin.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`📍 Test Deployment Instance Address: ${contractAddress}`);
  
  // Profile Multi-Recipient Batch Allocation (Optimized Loop Testing)
  const users = [recipient.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
  const amount = 1000;
  
  const tx = await contract.processBatchAllocation(users, amount);
  const receipt = await tx.wait();
  
  console.log(`🔥 Batch Allocation Gas Spent: ${receipt?.gasUsed.toString()} gas units`);
  console.log(`💡 Average per-user gas overhead: ${Number(receipt?.gasUsed) / users.length} units\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
