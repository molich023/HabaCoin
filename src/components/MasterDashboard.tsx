"use client";

import React, { useState } from 'react';
import PasskeyWallet from './PasskeyWallet';
import LiveValuationCard from './LiveValuationCard';
import TokenomicsDashboard from './TokenomicsDashboard';
import { sendGaslessClaimTransaction } from '../web3/gaslessEngine';

export default function MasterDashboard() {
  const [activeUserWallet, setActiveUserWallet] = useState<string | null>(null);
  const [isSponsoring, setIsSponsoring] = useState<boolean>(false);

  const handleGaslessExecution = async () => {
    setIsSponsoring(true);
    try {
      const res = await sendGaslessClaimTransaction(activeUserWallet || "0xUserWalletAddress", 25.00);
      if (res.success) {
        alert(`⛽ GASLESS TRANSACTION SUCCESSFUL!\n\nYour transaction was completely sponsored by the HabaCoin Paymaster pool.\nTxn Hash: ${res.txnHash}`);
      }
    } catch (err) {
      alert("Paymaster transaction rejected.");
    } finally {
      setIsSponsoring(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white p-4 sm:p-8 space-y-8">
      {/* Upper Navigation Row */}
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-amber-500">HABACOIN PWA v1.0</h1>
          <p className="text-xs text-slate-400">Nairobi Node Production Server Terminal Connected</p>
        </div>
        <div className="text-right text-xs font-mono text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-md border border-emerald-500/10">
          ● Secure Layer-2 Environment
        </div>
      </div>

      {/* Grid Allocation Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Cryptographic Authentication Bridge */}
        <div className="space-y-4">
          <PasskeyWallet />
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2">
            <span className="font-bold text-slate-400 block">Sponsor Verification Details</span>
            <p className="text-slate-500">Account Abstraction abstracts gas execution constraints automatically for mobile devices across Kenyan communication protocols.</p>
            <button 
              onClick={handleGaslessExecution}
              disabled={isSponsoring}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 font-bold py-2 rounded-xl border border-purple-400/20 disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all text-[11px] uppercase tracking-wider"
            >
              {isSponsoring ? "Processing Paymaster Sponsoring..." : "Execute Test Gasless Claim"}
            </button>
          </div>
        </div>

        {/* Column 2 & 3: Master Valuation Ledger and Operational Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <LiveValuationCard />
          <TokenomicsDashboard />
        </div>
      </div>
    </div>
  );
}
