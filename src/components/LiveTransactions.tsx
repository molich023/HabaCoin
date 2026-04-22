"use client";
import { useEffect, useState } from 'react';
import { Activity, ExternalLink, Shield } from 'lucide-react';

// Sample data structure for the 2026 Live Feed
const MOCK_TXS = [
  { id: '0x3a...f12', amount: 450.50, time: '2s ago', type: 'Mining Reward' },
  { id: '0x8b...e91', amount: 1200.00, time: '14s ago', type: 'P2P Transfer' },
  { id: '0x1c...a44', amount: 55.20, time: '45s ago', type: 'PTC Claim' },
];

export default function LiveTransactions() {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black italic flex items-center gap-2 text-sm">
          <Activity size={16} className="text-green-500" /> LIVE HABA LEDGER
        </h3>
        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase">
          <Shield size={10} className="text-blue-500" /> Privacy Mode Active
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_TXS.map((tx, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 text-[10px] font-mono">
                {tx.id.substring(0, 4)}
              </div>
              <div>
                <p className="text-white text-xs font-mono">{tx.id}</p>
                <p className="text-[9px] text-gray-500 uppercase">{tx.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-green-400 text-xs font-bold">+{tx.amount} HABA</p>
              <p className="text-[9px] text-gray-600">{tx.time}</p>
            </div>
            
            {/* Direct Link to PolygonScan for "Truth Verification" */}
            <a href={`https://polygonscan.com/tx/${tx.id}`} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <ExternalLink size={12} className="text-gray-500" />
            </a>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-[10px] text-gray-500 font-bold hover:bg-white/5 transition-all uppercase tracking-widest">
        View Full Explorer on PolygonScan
      </button>
    </div>
  );
}
