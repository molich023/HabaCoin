"use client";

import React, { useState } from 'react';
import { Send, UserCheck, AlertTriangle, CheckCircle2, ArrowRightLeft } from 'lucide-react';

export default function P2PTransferPortal({ currentBalance, onTransferSuccess }: { currentBalance: number; onTransferSuccess: () => void }) {
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<{ email: string; name?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Real-time address existence verification check
  const verifyRecipient = async () => {
    if (!recipientIdentifier.includes('@') && recipientIdentifier.length < 3) {
      setErrorMessage("Provide a valid registered identifier.");
      return;
    }
    
    setIsVerifying(true);
    setErrorMessage('');
    setVerifiedUser(null);

    try {
      const response = await fetch('/api/p2p/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recipientIdentifier.trim() })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setErrorMessage(data.reason || "Account not registered in the Haba Ecosystem.");
      } else {
        setVerifiedUser({ email: data.user.email, name: data.user.name });
      }
    } catch {
      setErrorMessage("Network verification failure.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Dispatch tokens to verified counterparty target 
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedUser) return;

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Enter a valid token payment weight.");
      return;
    }

    if (amount > currentBalance) {
      setErrorMessage("Transaction aborted: Insufficient HABA token volume.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: verifiedUser.email,
          amount: amount
        })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.reason || "Ledger settlement failure.");
      } else {
        setSuccessMessage(`Settled: ${amount.toLocaleString()} HABA successfully transfered.`);
        setRecipientIdentifier('');
        setTransferAmount('');
        setVerifiedUser(null);
        if (onTransferSuccess) onTransferSuccess();
      }
    } catch {
      setErrorMessage("Failed to broadcast transaction to ledger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl max-w-md mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="text-blue-500" size={24} /> P2P HUSTLE PAY
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-1">Instant retail and commercial settlement</p>
        </div>
      </div>

      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-6 flex justify-between items-center">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Vault Balance</span>
        <span className="text-xl font-mono text-emerald-400 font-bold">{currentBalance.toLocaleString()} HABA</span>
      </div>

      <form onSubmit={handleTransferSubmit} className="space-y-4">
        {/* Recipient Field */}
        <div>
          <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Recipient Account (Email)</label>
          <div className="flex gap-2">
            <input 
              type="text"
              disabled={!!verifiedUser || isSubmitting}
              placeholder="e.g. partner@habacoin.com"
              value={recipientIdentifier}
              onChange={(e) => setRecipientIdentifier(e.target.value)}
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {!verifiedUser && (
              <button
                type="button"
                disabled={isVerifying || !recipientIdentifier}
                onClick={verifyRecipient}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-bold text-xs px-4 rounded-xl transition-colors tracking-wider uppercase"
              >
                {isVerifying ? 'Checking...' : 'Verify'}
              </button>
            )}
          </div>
        </div>

        {/* Verified Target Feedback Context */}
        {verifiedUser && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold font-mono">
              <UserCheck size={16} />
              <span>ACTIVE USER: {verifiedUser.name || verifiedUser.email}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setVerifiedUser(null)}
              className="text-[10px] font-mono text-gray-500 hover:text-white uppercase font-bold"
            >
              Reset
            </button>
          </div>
        )}

        {/* Amount Entry Field */}
        <div>
          <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Payment Amount (HABA)</label>
          <input 
            type="number"
            step="any"
            disabled={!verifiedUser || isSubmitting}
            placeholder="0.00"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
          />
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-3 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dynamic Action Trigger Button */}
        <button
          type="submit"
          disabled={!verifiedUser || isSubmitting || !transferAmount}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest disabled:text-neutral-500"
        >
          <Send size={14} />
          {isSubmitting ? 'SETTLING TRANSACTION...' : 'EXECUTE PAYMENT'}
        </button>
      </form>
    </div>
  );
}
