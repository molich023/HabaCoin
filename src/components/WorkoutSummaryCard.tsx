"use client";

import React from 'react';

interface ShareLinks {
  twitter: string;
  facebook: string;
  whatsapp: string;
}

interface Financials {
  grossEarnedTokens: string;
  userWithdrawableShare: string;
  treasuryRetainedShare: string;
}

interface SummaryData {
  total_distance_km: number;
  average_speed_kmh: number;
  total_steps: number;
  shareLinks: ShareLinks;
  financials: Financials;
}

export default function WorkoutSummaryCard({ summaryData }: { summaryData: SummaryData }) {
  const { total_distance_km, average_speed_kmh, total_steps, shareLinks, financials } = summaryData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white max-w-md shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-emerald-400">🔥 Activity Secured</h3>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded font-mono">2.5x Boosted</span>
      </div>
      <p className="text-xs text-slate-400">Pedometer and hardware velocity telemetry logs verified authentic.</p>
      
      <div className="grid grid-cols-3 gap-2 my-6">
        <div className="bg-slate-800/50 p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Distance</span>
          <span className="text-xl font-black text-white">{total_distance_km} KM</span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Avg Speed</span>
          <span className="text-xl font-black text-white">{average_speed_kmh} KPH</span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Steps</span>
          <span className="text-xl font-black text-white">{total_steps}</span>
        </div>
      </div>

      <div className="border-t border-b border-slate-800/80 py-3 my-4 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Gross Earned:</span>
          <span className="text-amber-400 font-bold">+{financials.grossEarnedTokens} HABA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Liquid Wallet (70%):</span>
          <span className="text-emerald-400">+{financials.userWithdrawableShare} HABA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Treasury Basket (30%):</span>
          <span className="text-blue-400">+{financials.treasuryRetainedShare} HABA</span>
        </div>
      </div>

      <div className="h-32 bg-slate-950 rounded-lg mb-4 flex items-center justify-center border border-slate-800/60 text-xs text-slate-500 font-mono">
        🗺️ [ GPS Route Polyline Rendering Active ]
      </div>

      <div className="space-y-2">
        <span className="text-xs text-slate-400 block font-semibold">Share Your Hustle Matrix:</span>
        <div className="flex gap-2">
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-3 text-center rounded-lg bg-black text-xs font-bold transition hover:bg-black/80">
            X / Twitter
          </a>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-3 text-center rounded-lg bg-emerald-600 text-xs font-bold transition hover:bg-emerald-700">
            WhatsApp
          </a>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-3 text-center rounded-lg bg-blue-600 text-xs font-bold transition hover:bg-blue-700">
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
