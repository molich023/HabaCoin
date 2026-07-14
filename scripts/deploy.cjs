const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("📡 Initializing deployment with account:", deployer.address);

  const HabaCoin = await ethers.getContractFactory("HabaCoin");
  
  console.log("⏳ Deploying UUPS Proxy and upgraded HabaCoin implementation...");
  
  // Initialize with deployer as owner, and deployer address as verifier (for testing)
  const habaProxy = await upgrades.deployProxy(HabaCoin, [deployer.address, deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });

  await habaProxy.waitForDeployment();
  
  const proxyAddress = await habaProxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("\n==================================================");
  console.log("🚀 HABACOIN MOVE-TO-EARN CONTRACT DEPLOYED!");
  console.log(`📍 UUPS Proxy Address (Global Token): ${proxyAddress}`);
  console.log(`🧠 Logic Implementation Address: ${implementationAddress}`);
  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
