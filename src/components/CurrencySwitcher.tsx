"use client";
import { useState, useEffect } from 'react';

interface CurrencyData {
  currency: string;
  rate: number;
  symbol: string;
}

export default function CurrencySwitcher({ usdAmount }: { usdAmount: number }) {
  const [isLocal, setIsLocal] = useState(false);
  const [data, setData] = useState<CurrencyData>({ currency: 'USD', rate: 1, symbol: '$' });

  useEffect(() => {
    fetch('/api/get-user-currency')
      .then(res => {
        if (!res.ok) throw new Error("Network response hardening trigger");
        return res.json();
      })
      .then((resData: Partial<CurrencyData>) => {
        setData({
          currency: resData.currency || 'USD',
          rate: typeof resData.rate === 'number' ? resData.rate : 1,
          symbol: resData.symbol || '$'
        });
      })
      .catch(() => {
        // Safe fallback in case of connection drop, automated scans, or API timeouts
        setData({ currency: 'USD', rate: 1, symbol: '$' });
      });
  }, []);

  const safeUsdAmount = typeof usdAmount === 'number' && !isNaN(usdAmount) ? usdAmount : 0;
  const displayValue = isLocal 
    ? (safeUsdAmount * data.rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) 
    : safeUsdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-4 rounded-3xl w-full max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Balance Mode</span>
        <button 
          onClick={() => setIsLocal(!isLocal)}
          aria-label="Toggle local currency format"
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={`${isLocal ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Total Haba Value</p>
          <h2 className="text-3xl font-black text-white font-mono">
            {isLocal ? data.symbol : '$'}{displayValue}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-blue-400 font-bold">{isLocal ? data.currency : 'USD'}</p>
          <p className="text-[8px] text-gray-600">1 HABA = {((safeUsdAmount / 100) * data.rate).toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}

