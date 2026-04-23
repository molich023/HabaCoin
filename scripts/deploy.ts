import { ethers } from "hardhat";

async function main() {
  // Your Netlify Oracle Address (The 'Truth' source)
  const oracleAddress = "0xYourNetlifyFunctionWalletAddress";

  const Haba = await ethers.getContractFactory("HabaSPow");
  const haba = await Haba.deploy(oracleAddress);

  await haba.waitForDeployment();

  console.log(`HabaCoin deployed to: ${await haba.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
