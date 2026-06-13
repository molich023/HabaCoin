"use client";
import { useState, ChangeEvent } from 'react';
import { Send, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

interface HabaSendProps {
  userAddress: string;
  habaBalance: number;
}

export default function HabaSend({ userAddress, habaBalance }: HabaSendProps) {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSend = async () => {
    // Basic structural checks
    if (!recipient || !amount) return;
    
    // Address format validation prior to pipeline initialization
    if (!ethers.isAddress(recipient)) {
      setStatus('error');
      setErrorMessage("INVALID RECIPIENT WALLET ADDRESS");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > habaBalance) {
      setStatus('error');
      setErrorMessage("INVALID DISBURSEMENT AMOUNT");
      return;
    }

    // Prevent form submission double-dipping / state exploitation
    setStatus('sending');
    setErrorMessage("");

    try {
      if (!window.ethereum) throw new Error("No provider installed.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const habaContract = new ethers.Contract(
        "0xYourHabaContractAddress", 
        ["function transfer(address to, uint256 amount) public returns (bool)"], 
        signer
      );

      // Execute transfer using proper 18-decimal token conversion
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await habaContract.transfer(recipient, parsedAmount);
      
      // Block UI until transaction explicitly clears at block height level
      await tx.wait(); 

      setStatus('success');
      setAmount("");
      setRecipient("");
    } catch (err) {
      console.error("[METAMASK HARDENING CATCH]", err);
      setStatus('error');
      setErrorMessage("TRANSACTION ABORTED OR INSUFFICIENT GAS");
    }
  };

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl select-none">
      <div className="flex items-center gap-2 mb-6">
        <Send size={18} className="text-blue-500" />
        <h3 className="text-white font-black italic uppercase text-sm tracking-tighter">Initiate Hustle Transfer</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold ml-2">Recipient Address</label>
          <input 
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value.trim())}
            disabled={status === 'sending'}
            className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-mono text-xs focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex justify-between ml-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold">Amount (HABA)</label>
            <span className="text-[10px] text-blue-400 font-bold">MAX: {habaBalance.toLocaleString()}</span>
          </div>
          <input 
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            disabled={status === 'sending'}
            className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-mono text-xl focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          />
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-[10px] bg-green-400/10 p-3 rounded-xl border border-green-400/20">
            <ShieldCheck size={14} /> TRANSACTION VERIFIED ON-CHAIN
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            <AlertCircle size={14} /> {errorMessage}
          </div>
        )}

        <button 
          onClick={handleSend}
          disabled={status === 'sending'}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase italic tracking-widest shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? <RefreshCw className="animate-spin" size={20} /> : "CONFIRM TRANSFER"}
        </button>
      </div>
    </div>
  );
}
