import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Maximizes execution efficiency and drops on-chain gas deployment costs
      },
    },
  },
  networks: {
    polygon: {
      // High-performance dRPC infrastructure endpoint link configuration
      url: process.env.DRPC_POLYGON_URL || "https://polygon.drpc.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;

