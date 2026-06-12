import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xDeployedContractAddressHere";
  const newOracleAddress = "0xNewRegionalOracleAddressHere";

  const [updater] = await ethers.getSigners();
  console.log(`Requesting role updates via admin: ${updater.address}`);

  const UbuntuToken = await ethers.getContractAt("UbuntuToken", contractAddress);
  
  // Keccak256 hash formatting corresponding to your smart contract's ORACLE_ROLE definition
  const ORACLE_ROLE = ethers.id("ORACLE_ROLE");
  
  const tx = await UbuntuToken.grantRole(ORACLE_ROLE, newOracleAddress);
  await tx.wait();

  console.log(`Success: Granted ORACLE_ROLE capability to ${newOracleAddress}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
