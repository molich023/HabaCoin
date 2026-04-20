"use client";
import { useState, useEffect } from 'react';
import { LucidePickaxe, Zap, TrendingUp } from 'lucide-react';

export default function MiningDashboard() {
  const [balance, setBalance] = useState(0.00000000);
  const [hashRate, setHashRate] = useState(0);
  const [isMining, setIsMining] = useState(false);

  // 1. Simulate real-time accumulation for UI "feel"
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMining) {
      interval = setInterval(() => {
        setBalance(prev => prev + 0.0000125); // Corresponds to HABA difficulty logic
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining]);

  const toggleHustle = () => {
    setIsMining(!isMining);
    if (!isMining) {
      // Trigger the WASM miner and the Service Worker sync
      console.log("HabaCoin: Starting Momentum Hustle...");
      setHashRate(Math.floor(Math.random() * 500) + 100); // Simulated GH/s
    } else {
      setHashRate(0);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-green-900/30 rounded-3xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-green-500 flex items-center gap-2">
          <LucidePickaxe size={20} /> Active Hustle
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-mono ${isMining ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
          {isMining ? 'LIVE' : 'IDLE'}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Unclaimed HABA</p>
        <h1 className="text-5xl font-black text-white font-mono break-all">
          {balance.toFixed(8)}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
            <Zap size={12} /> Hashrate
          </p>
          <p className="text-xl font-bold">{hashRate} GH/s</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> Efficiency
          </p>
          <p className="text-xl font-bold">98.2%</p>
        </div>
      </div>

      <button 
        onClick={toggleHustle}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
          isMining 
          ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
          : 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        }`}
      >
        {isMining ? 'STOP HUSTLE' : 'START MINING'}
      </button>
    </div>
  );
}
