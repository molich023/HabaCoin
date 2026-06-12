import { ethers } from "hardhat";

async function main() {
  // Your Netlify Oracle Server Wallet Address (The multi-fiat matrix truth anchor)
  const oracleAddress = process.env.ORACLE_PUBLIC_ADDRESS || "0xYourNetlifyFunctionWalletAddress";

  console.log("Preparing deployment pipeline for UbuntuToken ($UBUNTU)...");

  // Create contract factories mapping exactly to our renamed specifications
  const UbuntuTokenFactory = await ethers.getContractFactory("UbuntuToken");
  const tokenContract = await UbuntuTokenFactory.deploy(oracleAddress);

  await tokenContract.waitForDeployment();

  const contractAddress = await tokenContract.getAddress();
  console.log(`===================================================`);
  console.log(`HabaCoin Ecosystem Core Asset Deployed Successfully!`);
  console.log(`Ubuntu Token ($UBUNTU) Address: ${contractAddress}`);
  console.log(`Authorized System Oracle Set To: ${oracleAddress}`);
  console.log(`===================================================`);
}

main().catch((error) => {
  console.error("Critical deployment pipeline interruption failure:", error);
  process.exitCode = 1;
});
