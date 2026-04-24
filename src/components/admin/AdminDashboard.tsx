"use client";
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Users, Zap, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="bg-black min-h-screen p-4 pb-24">
      {/* Network Health Header */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 p-4 rounded-3xl border border-blue-500/20">
          <Activity className="text-blue-400 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black">Network Health</p>
          <p className="text-xl font-mono text-white">98.2%</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-3xl border border-green-500/20">
          <Zap className="text-green-400 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black">Total Burned</p>
          <p className="text-xl font-mono text-white">14.2k</p>
        </div>
      </div>

      {/* Live Alerts Feed */}
      <div className="bg-slate-900/50 rounded-[2.5rem] p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase italic flex items-center gap-2">
            <Bell className="text-yellow-500" size={18} />
            Security Feed
          </h3>
          <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-1 rounded-full animate-pulse">LIVE</span>
        </div>

        <div className="space-y-4">
          {/* Example Suspicious Pattern Alert */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-black text-red-400 uppercase">Suspicious Pattern</p>
              <p className="text-[9px] text-gray-500 font-mono">07:41:02</p>
            </div>
            <p className="text-xs text-white mb-2">User 0x550e... solved Sudoku Expert in 42s.</p>
            <button className="text-[9px] bg-red-500 text-white px-3 py-1 rounded-lg font-bold uppercase">
              Freeze Account
            </button>
          </div>

          {/* Example Scan Failure */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
            <p className="text-[10px] font-black text-yellow-400 uppercase mb-1">Scan Failure</p>
            <p className="text-xs text-white">Device Integrity Failed: Emulator Detected (UserLand-Bypass attempt).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
