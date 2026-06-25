import { ethers } from "ethers";

const ALCHEMY_URL = process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_RPC_URL || "";
const DRPC_URL = process.env.NEXT_PUBLIC_DRPC_POLYGON_RPC_URL || "";

/**
 * Initializes a resilient Web3 provider that links Alchemy and dRPC as a failover cluster
 */
export function getSecurePolygonProvider(): ethers.providers.BaseProvider {
  if (!ALCHEMY_URL && !DRPC_URL) {
    throw new Error("Missing both Alchemy and dRPC network configurations.");
  }

  const providers: ethers.providers.BaseProvider[] = [];

  // 1. Add Alchemy as Primary (Fast execution context)
  if (ALCHEMY_URL) {
    providers.push(new ethers.providers.JsonRpcProvider(ALCHEMY_URL));
  }

  // 2. Add dRPC as High-Availability Backup (Prevents application down-time)
  if (DRPC_URL) {
    providers.push(new ethers.providers.JsonRpcProvider(DRPC_URL));
  }

  // 3. Link them seamlessly into a single fallback manager
  return new ethers.providers.FallbackProvider(providers, 1);
}
