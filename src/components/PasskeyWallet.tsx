"use client";

import React, { useState } from 'react';

export default function PasskeyWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBiometricAuth = async () => {
    setLoading(true);
    // Simulate MetaMask Embedded Wallet Passkey authorization
    setTimeout(() => {
      setWalletAddress("0x71C...HabaSecureNode");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase">Biometric Keyring</h3>
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      </div>

      {walletAddress ? (
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-slate-500 block">Active Smart Account</label>
          <div className="bg-slate-950 px-3 py-2 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
            {walletAddress}
          </div>
        </div>
      ) : (
        <button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-150 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Verifying Passkey..." : "Authenticate via FaceID/Fingerprint"}
        </button>
      )}
    </div>
  );
}
