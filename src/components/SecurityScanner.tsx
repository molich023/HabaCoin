"use client";
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Fingerprint, Cpu, Lock, CheckCircle2 } from 'lucide-react';

const SECURITY_CHECKS = [
  { id: 1, label: "Verifying Device Integrity", icon: <Fingerprint size={18}/> },
  { id: 2, label: "Scanning for Memory Injection", icon: <Cpu size={18}/> },
  { id: 3, label: "Checking Peer-to-Peer Handshake", icon: <Lock size={18}/> },
  { id: 4, label: "Validating Stake Escrow", icon: <ShieldAlert size={18}/> }
];

export default function SecurityScanner({ onComplete, gameName }: { onComplete: () => void, gameName: string }) {
  const [currentCheck, setCurrentCheck] = useState(0);

  useEffect(() => {
    if (currentCheck < SECURITY_CHECKS.length) {
      const timer = setTimeout(() => {
        setCurrentCheck(prev => prev + 1);
      }, 750); // Spaced out over ~3 seconds
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 500);
    }
  }, [currentCheck, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-full bg-blue-600/10 border border-blue-500/20 mb-4 animate-pulse">
            <ShieldAlert className="text-blue-500" size={48} />
          </div>
          <h2 className="text-white font-black uppercase italic text-2xl tracking-tighter">
            Haba Security Protocol
          </h2>
          <p className="text-[10px] text-blue-400 font-bold tracking-widest mt-2 uppercase">
            Entering: {gameName} Arena
          </p>
        </div>

        {/* Scan List */}
        <div className="space-y-6">
          {SECURITY_CHECKS.map((check, index) => (
            <div key={check.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`transition-colors duration-300 ${index <= currentCheck ? 'text-blue-400' : 'text-gray-700'}`}>
                  {check.icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${index <= currentCheck ? 'text-white' : 'text-gray-700'}`}>
                  {check.label}
                </span>
              </div>
              {index < currentCheck ? (
                <CheckCircle2 className="text-green-500 animate-in fade-in zoom-in" size={16} />
              ) : index === currentCheck ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : null}
            </div>
          ))}
        </div>

        {/* Footer Branding */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-[8px] text-gray-600 font-mono uppercase">
            Oracle Engine v3.4.0-Alpha // Zero-Knowledge Verification
          </p>
        </div>
      </div>
    </div>
  );
}
