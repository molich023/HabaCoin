"use client";

import React, { useState } from 'react';

interface WalletMetrics {
  liquidBalance: number;    // 70% Cut
  treasuryBacking: number;  // 30% Cut
  vestedTotal: number;      // 5-Year Engine locked
  claimableVested: number;  // Vesting unlockable balance
}

export default function TokenomicsDashboard() {
  // Mock data representing a typical user's state parameters
  const [metrics, setMetrics] = useState<WalletMetrics>({
    liquidBalance: 45.50,
    treasuryBacking: 19.50,
    vestedTotal: 500.00,
    claimableVested: 25.00
  });

  const handleEarlyEmergencySlashWithdrawal = () => {
    const penalty = metrics.claimableVested * 0.25;
    const securePayout = metrics.claimableVested * 0.75;
    
    alert(
      `⚠️ EMERGENCY SLASH TRIGGERED!\n\n` +
      `You are attempting to bypass the 5-year vesting engine rules.\n` +
      `• Penalty Slashed (Burned/Treasury): -${penalty.toFixed(2)} HABA\n` +
      `• Safe Payout Transferred: +${securePayout.toFixed(2)} HABA\n\n` +
      `To protect token value, always walk the distance!`
    );
  };

  return (
    <div className="bg-slate-950 min-h-screen p-6 text-white font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">HABAC0IN <span className="text-emerald-400">VAULT MATRIX</span></h1>
          <p className="text-sm text-slate-400 mt-1">Real-time accounting ledger & smart contract vesting pipelines</p>
        </div>

        {/* 1. Core 70/30 Split Accounting Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-500" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Liquid Balance (70%)</span>
            <h2 className="text-4xl font-black mt-2 text-white">{metrics.liquidBalance.toFixed(2)} <span className="text-xl font-normal text-slate-500">HABA</span></h2>
            <p className="text-xs text-slate-400 mt-2">Available for weekly payroll transfers and regional phone bills.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-500" />
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold">Treasury Backing (30%)</span>
            <h2 className="text-4xl font-black mt-2 text-white">{metrics.treasuryBacking.toFixed(2)} <span className="text-xl font-normal text-slate-500">HABA</span></h2>
            <p className="text-xs text-slate-400 mt-2">Permanently locked to compound physical silver & asset basket reserves.</p>
          </div>
        </div>

        {/* 2. 5-Year Linear Vesting Scheduler Deck */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">5-Year Continuous Vesting Runway</h3>
              <p className="text-xs text-slate-400">Ecosystem airdrops and genesis block founder allocations</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Allocated Portfolio</span>
              <span className="text-sm font-mono font-bold text-amber-400">{metrics.vestedTotal.toFixed(2)} HABA</span>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="w-full bg-slate-950 rounded-full h-3 mb-6 p-0.5 border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-[12%]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-lg border border-slate-800/60">
            <div>
              <span className="text-xs text-slate-400 block">Current Claimable Balance</span>
              <span className="text-2xl font-black text-white font-mono">{metrics.claimableVested.toFixed(2)} HABA</span>
            </div>
            
            {/* 3. 25% Early Slash Penalty Core Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-500/10">
                Standard Claim
              </button>
              <button 
                onClick={handleEarlyEmergencySlashWithdrawal}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs rounded-lg border border-red-500/20 transition-all"
              >
                Emergency Withdrawal (25% Slash)
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-[11px] text-red-400/80 bg-red-500/5 p-2.5 rounded border border-red-500/10">
            <span>ℹ️</span>
            <span>Emergency withdrawals bypass the linear vesting safety timeline by burning 25% of your claimable value straight into the global burn address.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
