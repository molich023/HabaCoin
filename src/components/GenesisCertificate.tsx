"use client";
import React, { useRef } from "react";
import { usePDF } from "react-to-pdf";
import { Award, ShieldCheck, Zap } from "lucide-react";

export default function GenesisCertificate({ userName, habaBalance }: { userName: string, habaBalance: number }) {
  const { toPDF, targetRef } = usePDF({ filename: `Haba_Genesis_${userName}.pdf` });

  if (habaBalance < 1000) return null;

  return (
    <div className="mt-8 flex flex-col items-center">
      {/* Hidden Certificate Template (The part that becomes a PDF) */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={targetRef} 
          className="w-[800px] h-[600px] bg-slate-950 p-12 border-[20px] border-blue-900/30 flex flex-col justify-between text-center font-sans relative overflow-hidden"
        >
          {/* Background Decorative "Energy" */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-center mb-4">
            <Award size={80} className="text-yellow-500" />
          </div>

          <h1 className="text-blue-500 text-5xl font-black italic tracking-tighter uppercase mb-2">
            Genesis Certificate
          </h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">Haba Protocol • Verified Pioneer</p>

          <div className="space-y-4">
            <p className="text-gray-500 italic">This document certifies that</p>
            <h2 className="text-white text-4xl font-bold border-b-2 border-white/10 pb-2 inline-block px-10">
              {userName}
            </h2>
            <p className="text-gray-400 text-lg">
              Has successfully secured 1,000+ HABA through the <br/> 
              <span className="text-blue-400 font-bold">April 2026 Genesis Distribution.</span>
            </p>
          </div>

          <div className="flex justify-between items-end mt-12">
            <div className="text-left">
              <p className="text-[10px] text-gray-600 font-mono">VERIFICATION HASH</p>
              <p className="text-[8px] text-gray-500 font-mono">HABA-2026-{btoa(userName).substring(0, 12).toUpperCase()}</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={32} className="text-green-500 mb-1" />
              <p className="text-[10px] text-white font-bold">HARD-ASSET BACKED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visible Trigger Button */}
      <button 
        onClick={() => toPDF()}
        className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 rounded-2xl text-white font-black italic tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-600/20"
      >
        <Zap size={20} className="animate-pulse" />
        CLAIM GENESIS CERTIFICATE
        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 scale-110 opacity-0 group-hover:opacity-100 transition-all"></div>
      </button>
      <p className="text-[10px] text-gray-500 mt-3">Requires 1,000 HABA Balance • Truth-Verified</p>
    </div>
  );
}
