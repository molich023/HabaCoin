"use client";

import React, { useState } from 'react';

export default function AAdsBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      {/* A-ADS STICKY AD UNIT 2445593 FRAMEWORK CONTAINER */}
      <div className="fixed top-0 left-0 right-0 z-[99999] w-full pointer-events-none">
        <div className="relative max-w-lg mx-auto w-full flex items-center justify-center p-2 pt-3">
          
          {/* Close Handle Trigger Override */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded bg-white/80 hover:bg-white text-black transition-all cursor-pointer z-[99999] border border-slate-300 pointer-events-auto shadow-sm"
            aria-label="Close Advertisement"
          >
            <svg fill="#000000" height="12px" width="12px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
              <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
            </svg>
          </button>

          {/* Core Adaptive Iframe Wrapper */}
          <div className="w-full text-center flex justify-center pointer-events-auto">
            <iframe 
              data-aa="2445593" 
              src="https://acceptable.a-ads.com/2445593/?size=Adaptive" 
              style={{
                border: 0,
                padding: 0,
                width: '75%',
                height: '60px',
                overflow: 'hidden',
                margin: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          </div>

        </div>
      </div>
      {/* Padding spacer to prevent header content collision under top sticky ads */}
      <div className="h-[76px] w-full" />
    </>
  );
}
