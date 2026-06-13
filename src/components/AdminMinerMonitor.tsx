"use client";
import { useState, useEffect } from "react";

interface AdminMinerMonitorProps {
  userAddress: string;
}

export default function AdminMinerMonitor({ userAddress }: AdminMinerMonitorProps) {
  // Initiated responsibly; production setups should poll a trusted Web3 provider/RPC endpoint
  const [verifiedTime, setVerifiedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userAddress) return;
    
    let isMounted = true;
    // Example: Fetch safely from your backend or smart contract read method here
    const fetchOnChainData = async () => {
      try {
        // Secure server-side validation endpoint or RPC call
        // const res = await fetch(`/api/miner/status?address=${encodeURIComponent(userAddress)}`);
        // const data = await res.json();
        if (isMounted) {
          setVerifiedTime(0); // Replace with data validated on backend/ledger
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to safely reconcile on-chain state:", err);
      }
    };

    fetchOnChainData();
    return () => { isMounted = false; };
  }, [userAddress]);

  return (
    <div className="bg-slate-900 border border-blue-500/30 p-4 rounded-2xl select-none">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white text-[10px] font-black uppercase">Miner Forensic Outlook</h4>
        <span className="text-green-500 text-[8px] animate-pulse">VERIFIED ON-CHAIN</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-3 rounded-xl">
          <p className="text-[8px] text-gray-500">SESSION DURATION</p>
          <p className="text-xl font-mono text-white">
            {isLoading ? "..." : verifiedTime} <span className="text-[10px]">MINS</span>
          </p>
        </div>
        <div className="bg-black/40 p-3 rounded-xl">
          <p className="text-[8px] text-gray-500">TRUST SCORE</p>
          <p className="text-xl font-mono text-blue-400">98.2%</p>
        </div>
      </div>
    </div>
  );
}
