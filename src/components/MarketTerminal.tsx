"use client";
import Script from 'next/script';
import { useEffect, useState } from 'react';

// Custom Web Component typings definition for React JSX parser stability
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gecko-coin-price-static-list-widget': any;
    }
  }
}

export default function MarketTerminal() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 select-none">
      <h3 className="p-4 bg-black text-xs font-bold text-gray-500 uppercase tracking-tighter">
        Global Market Pulse (Real-Time)
      </h3>
      
      {isMounted && (
        <div className="w-full bg-slate-950 min-h-[200px]">
          {/* Hardened and sandboxed script loader execution rule */}
          <Script 
            src="https://widgets.coingecko.com/gecko-coin-price-static-list-widget.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <gecko-coin-price-static-list-widget 
            locale="en" 
            coin-ids="bitcoin,ethereum,polygon,solana" 
            initial-currency="usd" 
            realtime="true"
          />
        </div>
      )}
    </div>
  );
}

