"use client";

import React, { useState, useEffect } from 'react';

export default function LiveValuationCard() {
  const [usdtRate, setUsdtRate] = useState<number>(129.50); // Live Kes Baseline fallback
  const [habaBalance, setHabaBalance] = useState<number>(150.00);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Programmatic dynamic feed fetching from public price layers
    async function fetchLiveRates() {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=kes");
        const data = await response.json();
        if (data.tether && data.tether.kes) {
          setUsdtRate(data.tether.kes);
        }
      } catch (error) {
        console.error("Using local cache baseline value matrix:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 60000); // Live tick refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const habaValuationUsdt = habaBalance * 0.005; // Base algorithmic peg matrix mapping
  const habaValuationKes = habaValuationUsdt * usdtRate;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white max-w-md shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Live Vault Reserves</h3>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Live Feed
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-slate-400">Total Asset Holding Worth</span>
        <h1 className="text-3xl font-black font-mono text-white">
          KES {loading ? "---" : habaValuationKes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <p className="text-xs font-mono text-slate-500">
          ≈ {habaValuationUsdt.toFixed(2)} USDT <span className="text-[10px]">(@ KES {usdtRate.toFixed(2)}/USDT)</span>
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500 block">Your Token Ledger</span>
          <span className="text-sm font-bold text-amber-400">{habaBalance.toFixed(2)} HABA</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Fixed Target Peg</span>
          <span className="text-sm text-slate-300">0.005 USDT</span>
        </div>
      </div>
    </div>
  );
}
