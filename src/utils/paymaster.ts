import { createEcdsaKernelAccountClient } from "@zerodev/sdk";
import { http, createPublicClient } from "viem";
import { baseMainnet, baseSepolia } from "viem/chains";

// Detect chain state using Next environment configuration arrays
const isMainnet = process.env.NEXT_PUBLIC_BASE_CHAIN_ID === "0x2105";
const activeChain = isMainnet ? baseMainnet : baseSepolia;

// 1. Initialize your stable Chainstack Node Endpoint
const chainstackPublicClient = createPublicClient({
  chain: activeChain,
  transport: http(process.env.NEXT_PUBLIC_INFURA_RPC_URL) // Points to your Chainstack endpoint
});

/**
 * Instantiate the ZeroDev Client with automated Gas Sponsorship
 * Maps standard transactions into gasless ERC-4337 UserOperations
 */
export const initializeHabaWallet = async (userSigner: any) => {
  const zeroDevProjectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
  
  if (!zeroDevProjectId) {
    throw new Error("ZeroDev Project ID missing from environmental definitions.");
  }

  const accountClient = await createEcdsaKernelAccountClient({
    projectId: zeroDevProjectId,
    owner: userSigner,
    chain: activeChain,
    transport: http(`https://rpc.zerodev.app/api/v2/paymaster/${zeroDevProjectId}`),
    sponsorUserOperation: true // Instructs ZeroDev to pay the user gas fee layout
  });
  
  return accountClient;
};
