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
        alert(`⛽ GASLESS TRANSACTION SUCCESSFUL!\n\nSponsored by the HabaCoin Paymaster pool.\nTxn Hash: ${res.txnHash}`);
      }
    } catch (err) {
      alert("Paymaster transaction rejected.");
    } finally {
      setIsSponsoring(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white p-4 sm:p-8 space-y-8">
      {/* Upper Navigation Row with the new Realized Silver Logo */}
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/habacoin-logo.png" 
            alt="HabaCoin Silver Logo" 
            className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.2)] rounded-full border border-slate-800"
            onError={(e) => {
              // Graceful fallback URL pointing directly to your live production Netlify asset bucket
              e.currentTarget.src = "https://habacoin.netlify.app/assets/habacoin-logo.png";
            }}
          />
          <div>
            <h1 className="text-2xl font-black tracking-wider text-amber-500">HABACOIN PWA v1.0</h1>
            <p className="text-xs text-slate-400">Nairobi Node Production Server Terminal Connected</p>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-md border border-emerald-500/10 hidden sm:block">
          ● Secure Layer-2 Environment
        </div>
      </div>

      {/* Grid Allocation Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-4">
          <PasskeyWallet />
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2">
            <span className="font-bold text-slate-400 block">Sponsor Verification Details</span>
            <p className="text-slate-500">Account Abstraction coordinates gas execution constraints automatically for mobile networks.</p>
            <button 
              onClick={handleGaslessExecution}
              disabled={isSponsoring}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 font-bold py-2 rounded-xl border border-purple-400/20 disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all text-[11px] uppercase tracking-wider"
            >
              {isSponsoring ? "Processing Paymaster Sponsoring..." : "Execute Test Gasless Claim"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <LiveValuationCard />
          <TokenomicsDashboard />
        </div>
      </div>
    </div>
  );
}
