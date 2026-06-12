import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xDeployedContractAddressHere";
  const treasuryDestination = process.env.TREASURY_MULTISIG_ADDRESS || "0xTreasuryWalletAddress";

  const [admin] = await ethers.getSigners();
  const UbuntuToken = await ethers.getContractAt("UbuntuToken", contractAddress);

  console.log(`Initiating treasury liquid settlement update via admin context: ${admin.address}`);
  
  const tx = await UbuntuToken.withdrawStakingReserves(treasuryDestination);
  await tx.wait();

  console.log(`Treasury vault balance swept cleanly to destination: ${treasuryDestination}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
