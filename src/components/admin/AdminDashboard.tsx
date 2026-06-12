"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Users, Zap, Bell } from 'lucide-react';

interface AlertLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'HIGH' | 'CRITICAL' | 'WARNING';
}

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [networkHealth, setNetworkHealth] = useState("99.8%");
  const [totalBurned, setTotalBurned] = useState("14,205");

  useEffect(() => {
    // Establish a hardened real-time Server-Sent Events (SSE) pipe to listen for telemetry
    const eventSource = new EventSource('/api/admin/realtime-alerts');
    
    eventSource.addEventListener('victory_ping', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Play native audios safely
        const audio = new Audio('/assets/victory_ping.mp3');
        audio.play().catch(() => console.log("Audio playback waiting for gesture interactions."));

        // 2. Trigger hardware-level tactile feedback patterns if available on device
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([100, 30, 100, 30, 300]);
        }

        console.log(`[+] Verification Success: ${data.message} - ${data.distance}km achieved.`);
      } catch (err) {
        console.error("Failed processing incoming victory alert payload:", err);
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE Streaming connection encountered a transport failure:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen p-4 pb-24 text-white font-sans">
      {/* Network Health Tracker Header */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-neutral-950 p-4 rounded-3xl border border-emerald-500/20">
          <Activity className="text-emerald-400 mb-2" size={20} />
          <p className="text-[10px] text-neutral-500 uppercase font-black tracking-wider">Network Health</p>
          <p className="text-xl font-mono text-white font-bold">{networkHealth}</p>
        </div>
        <div className="bg-neutral-950 p-4 rounded-3xl border border-yellow-500/20">
          <Zap className="text-yellow-400 mb-2" size={20} />
          <p className="text-[10px] text-neutral-500 uppercase font-black tracking-wider">Total $UBUNTU Burned</p>
          <p className="text-xl font-mono text-white font-bold">{totalBurned}</p>
        </div>
      </div>

      {/* Real-time Security Incident Monitoring Feed */}
      <div className="bg-neutral-950 rounded-[2rem] p-6 border border-neutral-900 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase tracking-tight flex items-center gap-2 text-sm">
            <Bell className="text-rose-500 animate-pulse" size={18} />
            Security Threat Stream
          </h3>
          <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full font-bold border border-rose-500/20 animate-pulse">
            LIVE TELEMETRY
          </span>
        </div>

        <div className="space-y-4">
          {/* Suspicious Pattern Event Card */}
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-2xl">
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Velocity Abuse Triggered</p>
              <p className="text-[9px] text-neutral-500 font-mono">07:41:02 UTC</p>
            </div>
            <p className="text-xs text-neutral-300 mb-3">User 0x550e... generated 5,000 steps in 42 seconds (Impossible stride threshold).</p>
            <button className="text-[10px] bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 rounded-xl font-extrabold uppercase transition-all duration-150 transform active:scale-95">
              Freeze Smart Contract Account
            </button>
          </div>

          {/* Sandbox Integrity Failure Event Card */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Device Integrity Failure</p>
              <p className="text-[9px] text-neutral-500 font-mono">07:39:15 UTC</p>
            </div>
            <p className="text-xs text-neutral-300">Rooted environment or unverified Android Emulator signature detected (UserLand-Bypass attempt flagged).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
