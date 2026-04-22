"use client";
import { useState } from 'react';
import { Send, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

export default function HabaSend({ userAddress, habaBalance }: { userAddress: string, habaBalance: number }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setStatus('sending');

    try {
      // 1. Initialize Provider/Signer (Assuming a browser wallet like MetaMask or Rabby)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const habaContract = new ethers.Contract(
        "0xYourHabaContractAddress", 
        ["function transfer(address to, uint256 amount) public returns (bool)"], 
        signer
      );

      // 2. Execute the Transfer
      const tx = await habaContract.transfer(recipient, ethers.parseUnits(amount, 18));
      await tx.wait(); // Wait for Polygon confirmation

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Send size={18} className="text-blue-500" />
        <h3 className="text-white font-black italic uppercase text-sm tracking-tighter">Initiate Hustle Transfer</h3>
      </div>

      <div className="space-y-4">
        {/* Recipient Input */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold ml-2">Recipient Address</label>
          <input 
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-mono text-xs focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between ml-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold">Amount (HABA)</label>
            <span className="text-[10px] text-blue-400 font-bold">MAX: {habaBalance}</span>
          </div>
          <input 
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-mono text-xl focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-[10px] bg-green-400/10 p-3 rounded-xl border border-green-400/20">
            <ShieldCheck size={14} /> TRANSACTION VERIFIED ON-CHAIN
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            <AlertCircle size={14} /> INSUFFICIENT GAS OR FUNDS
          </div>
        )}

        {/* The Action Button */}
        <button 
          onClick={handleSend}
          disabled={status === 'sending'}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase italic tracking-widest shadow-lg shadow-blue-600/20"
        >
          {status === 'sending' ? <RefreshCw className="animate-spin" size={20} /> : "CONFIRM TRANSFER"}
        </button>
      </div>
    </div>
  );
}
