"use client";
import React, { useState } from 'react';
import { 
  Smartphone, Car, Bike, Zap, Train, 
  Trash2, ShieldCheck, ChevronRight, Activity 
} from 'lucide-react';

const ASSET_TYPES = [
  { id: 'phone', label: 'Mobile Node', icon: Smartphone, mult: '1.0x', desc: 'Standard SPoW Mining' },
  { id: 'ev', label: 'Personal EV', icon: Car, mult: '2.5x', desc: 'Deep Storage & V2G Grid Support' },
  { id: 'tuktuk', label: 'Electric Tuktuk', icon: Zap, mult: '1.8x', desc: 'High-Frequency Urban Kinetic' },
  { id: 'hybrid', label: 'Hybrid Vehicle', icon: Activity, mult: '1.4x', desc: 'Regenerative Braking Yield' },
  { id: 'transit', label: 'Mass Transit', icon: Train, mult: '3.0x', desc: 'Bus/Train Passenger Multiplier' },
  { 
  id: 'active_human', 
  label: 'Bio-Node (Active)', 
  icon: Footprints, // Or Jogging icon
  mult: '1.2x', 
  desc: 'Walking/Running carbon point generation' 
},
{ 
  id: 'micro_mobility', 
  label: 'Bicycle / Scooter', 
  icon: Bike, 
  mult: '1.5x', 
  desc: 'Zero-emission personal transport' 
}
  
  { id: 'waste', label: 'Waste Management', icon: Trash2, mult: '2.0x', desc: 'Community Service & Proof of Work' },
];

export default function NodeIdentity() {
  const [selected, setSelected] = useState('phone');

  return (
    <div className="bg-slate-950 min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase">
          Identity <span className="text-blue-500">Protocol</span>
        </h2>
        <p className="text-gray-500 text-xs font-mono mt-2 uppercase tracking-widest">
          Select your primary energy asset to sync with the 100B HABA supply.
        </p>
      </div>

      {/* Asset Grid */}
      <div className="space-y-3">
        {ASSET_TYPES.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelected(asset.id)}
            className={`w-full group relative flex items-center p-4 rounded-2xl border transition-all duration-300 ${
              selected === asset.id 
              ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
              : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-3 rounded-xl mr-4 ${
              selected === asset.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
            }`}>
              <asset.icon size={24} />
            </div>

            <div className="flex-1 text-left">
              <h4 className="text-white font-bold text-sm uppercase tracking-tight italic">
                {asset.label}
              </h4>
              <p className="text-[10px] text-gray-500 font-mono leading-tight">
                {asset.desc}
              </p>
            </div>

            <div className="text-right">
              <span className={`text-xs font-black italic ${
                selected === asset.id ? 'text-blue-400' : 'text-gray-600'
              }`}>
                {asset.mult}
              </span>
              <div className="flex justify-end mt-1">
                <ChevronRight size={14} className={selected === asset.id ? 'text-blue-500' : 'text-gray-700'} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <button 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40"
        >
          <ShieldCheck size={20} />
          INITIATE NODE SYNC
        </button>
        <p className="text-center text-[9px] text-gray-600 mt-3 uppercase font-bold tracking-widest">
          Energy authentication secured via Cloudflare Turnstile
        </p>
      </div>
    </div>
  );
}
