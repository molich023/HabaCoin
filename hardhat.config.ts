import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      // Use your dRPC HTTPS link here
      url: process.env.DRPC_POLYGON_URL || "",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};

export default config;
