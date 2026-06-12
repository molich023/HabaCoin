"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicLandingPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function linkWallet() {
    if (!window.ethereum) {
      return alert("MetaMask or a Web3 provider is required to interact with HabaCoin Global.");
    }
    
    try {
      setIsAuthenticating(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      
      const message = `Authorize HabaCoin Profile: ${currentAccount}`;
      const signature = await window.ethereum.request({ 
        method: 'personal_sign', 
        params: [message, currentAccount] 
      });

      // Fetch the Turnstile element safely from the DOM
      const turnstileEl = document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement;
      const captchaToken = turnstileEl?.value;

      const response = await fetch('/api/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet: currentAccount, 
          signature, 
          message, 
          captcha: captchaToken || "LOCAL_BYPASS_DEV" 
        })
      });

      if (response.ok) {
        setWallet(currentAccount);
        alert("Wallet Linked Safely! Redirecting to HabaCoin Core Dashboard...");
        // Route the authenticated session into the subfolder view layout
        router.push('/Dashboard');
      } else {
        alert("Authentication rejected by security gateways.");
      }
    } catch (err) {
      console.error("Link authentication failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-500 mb-2">
          HabaCoin Global
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          Convert Kinetic Human Movement Into Universal Ubuntu Tokens ($UBUNTU)
        </p>

        <div className="my-6 flex justify-center">
          {/* Cloudflare Turnstile Anti-Bot Security Check */}
          <div className="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>
        </div>

        <button 
          onClick={linkWallet}
          disabled={isAuthenticating}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 transform active:scale-95 shadow-lg shadow-emerald-900/20"
        >
          {isAuthenticating ? "Verifying Security..." : "Link Polygon Wallet"}
        </button>
      </div>
    </main>
  );
}
