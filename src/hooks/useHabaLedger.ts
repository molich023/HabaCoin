import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface BlockchainTx {
  id: string;
  fullHash: string;
  amount: string;
  time: string;
  type: 'Mining Reward' | 'P2P Transfer';
}

const UBUNTU_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_UBUNTU_TOKEN_ADDRESS || "0xYourContractAddressHere"; 
const TRANSFER_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export function useHabaLedger() {
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_POLYGON_WSS_URL || "wss://polygon.drpc.org";
    
    // Connect a clean WebSocket provider session directly to our dRPC cluster matrix
    const provider = new ethers.WebSocketProvider(wsUrl);
    const tokenContract = new ethers.Contract(UBUNTU_TOKEN_ADDRESS, TRANSFER_ABI, provider);

    const handleTransferEvent = (from: string, to: string, value: bigint, event: any) => {
      try {
        const txHash = event.log.transactionHash;
        const formattedTx: BlockchainTx = {
          id: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
          fullHash: txHash,
          amount: parseFloat(ethers.formatUnits(value, 18)).toFixed(4),
          time: "Just now",
          type: from === ethers.ZeroAddress ? "Mining Reward" : "P2P Transfer"
        };

        setTransactions(prev => [formattedTx, ...prev].slice(0, 10));
      } catch (err) {
        console.error("Error parsing real-time blockchain log event:", err);
      }
    };

    tokenContract.on("Transfer", handleTransferEvent);

    return () => {
      tokenContract.removeAllListeners();
      provider.destroy();
      console.log("[-] Disconnected ledger websockets to safeguard device battery lifespan.");
    };
  }, []);

  return transactions;
}
