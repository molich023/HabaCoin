"use client";
import { useEffect, useState } from 'react';
import { Activity, ExternalLink, Shield, zap } from 'lucide-react';
import { ethers } from 'ethers';

// --- CONFIGURATION ---
const HABA_ADDRESS = "0xYourActualContractAddress"; 
const HABA_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const DRPC_WSS = `wss://lb.drpc.live/og/polygon/your-drpc-api-key`;

export default function LiveTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Initialize the Live Pulse (WebSocket)
    const provider = new ethers.WebSocketProvider(DRPC_WSS);
    const contract = new ethers.Contract(HABA_ADDRESS, HABA_ABI, provider);

    provider.on("block", () => setIsConnected(true));

    // 2. Listen for "The Hustle"
    contract.on("Transfer", (from, to, value, event) => {
      const txHash = event.log.transactionHash;
      
      const newTx = {
        id: txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 4),
        fullHash: txHash,
        amount: parseFloat(ethers.formatUnits(value, 18)).toLocaleString(),
        time: "Just now",
        // Logic: If 'from' is 0x000..., it's a new HABA distribution (Mining)
        type: from === ethers.ZeroAddress ? 'Mining Reward' : 'P2P Transfer'
      };

      setTransactions(prev => [newTx, ...prev].slice(0, 10));
    });

    // 3. Battery-Saving Cleanup (Crucial for mobile!)
    return () => {
      contract.removeAllListeners();
      provider.destroy();
    };
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h3 className="text-white font-black italic flex items-center gap-2 text-sm">
            <Activity size={16} className={`${isConnected ? 'text-green-500' : 'text-gray-600'} animate-pulse`} /> 
            LIVE HABA LEDGER
          </h3>
          <span className="text-[8px] text-blue-500 font-bold ml-6">POLYGON MAINNET</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase">
          <Shield size={10} className="text-blue-500" /> Privacy Shield ON
        </div>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Blockchain...</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.fullHash} className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all group border border-transparent hover:border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  tx.type === 'Mining Reward' ? 'bg-green-500/10 text-green-500' : 'bg-blue-600/10 text-blue-500'
                }`}>
                  {tx.type === 'Mining Reward' ? 'M' : 'T'}
                </div>
                <div>
                  <p className="text-white text-xs font-mono tracking-tighter">{tx.id}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">{tx.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-green-400 text-xs font-bold">+{tx.amount} HABA</p>
                  <p className="text-[9px] text-gray-600 font-medium">{tx.time}</p>
                </div>
                
                <a 
                  href={`https://polygonscan.com/tx/${tx.fullHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600/20"
                >
                  <ExternalLink size={12} className="text-blue-400" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-4 border border-white/5 rounded-2xl text-[10px] text-gray-400 font-black hover:bg-white/5 transition-all uppercase tracking-[0.2em] italic">
        Verified By Polygon Protocol
      </button>
    </div>
  );
}
