"use client";

import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

interface Advertisement {
  id: number;
  title: string;
  reward: number;
  url: string;
  timer: number;
}

const AD_LIST: Advertisement[] = [
  { id: 1, title: "Explore Polygon DeFi Ecosystem", reward: 50, url: "https://polygon.technology", timer: 15 },
  { id: 2, title: "Hustle Network Intelligence Newsletter", reward: 25, url: "https://habacoin.com/news", timer: 10 }
];

interface PTCDashboardProps {
  onRewardUpdate: () => void; // Trigger profile re-fetch instead of passing raw integer constants
}

export default function PTCDashboard({ onRewardUpdate }: PTCDashboardProps) {
  const [activeAdId, setActiveAdId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    let timerInstance: NodeJS.Timeout;
    
    if (activeAdId !== null && timeLeft > 0) {
      timerInstance = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInstance);
            executeSecureClaim();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInstance) clearInterval(timerInstance);
    };
  }, [activeAdId, timeLeft]);

  const startAdSession = async (ad: Advertisement) => {
    try {
      setActiveAdId(ad.id);
      setTimeLeft(ad.timer);

      // Enforce Server-Side Telemetry Tracking: Initialize interaction handshakes
      const response = await fetch('/api/ptc-session-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id })
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.reason || "Initialization failed.");
      }

      setSessionToken(data.sessionToken);
      
      // Sandbox target anchor reference context parameters
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      console.error("[!] Handshake failed:", err.message);
      setActiveAdId(null);
      setTimeLeft(0);
    }
  };

  const executeSecureClaim = async () => {
    if (activeAdId === null) return;

    try {
      // Backend acts as the single source of truth for execution validation
      const response = await fetch('/api/ptc-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adId: activeAdId,
          sessionToken: sessionToken
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`Validation Error: ${data.reason || 'Verification exception occurred.'}`);
      } else {
        alert(`Cryptographic Proof Verified: +${data.creditedAmount} HABA settled.`);
        if (onRewardUpdate) onRewardUpdate();
      }
    } catch (err) {
      console.error("Transmission error caught:", err);
    } finally {
      setActiveAdId(null);
      setSessionToken(null);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-3xl border border-blue-900/30">
      <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-tight font-mono">
        <Coins size={20} className="text-blue-500" /> PTC Verification Panel
      </h2>

      <div className="space-y-4">
        {AD_LIST.map((ad) => {
          const isCurrentAdActive = activeAdId === ad.id;

          return (
            <div key={ad.id} className="p-4 bg-black/40 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-sm tracking-wide">{ad.title}</p>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1">+{ad.reward} HABA</p>
              </div>
              
              <button 
                type="button"
                disabled={activeAdId !== null}
                onClick={() => startAdSession(ad)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:text-neutral-500"
              >
                {isCurrentAdActive ? `WAITING ${timeLeft}s` : 'VIEW CAMPAIGN'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
