"use client";

import { useEffect, useState } from 'react';
import MiningDashboard from '../components/MiningDashboard';
import GhostChat from '../components/GhostChat';

export default function HabaCoinHome() {
  const [user, setUser] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // 1. Initialize Netlify Identity
  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user: any) => setUser(user));
      window.netlifyIdentity.on('login', (user: any) => setUser(user));
      window.netlifyIdentity.on('logout', () => {
        setUser(null);
        setWalletAddress("");
      });
    }
  }, []);

  // 2. Wallet Link Logic
  const linkWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or use a Web3 Browser!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Request signature for security (Ghost Mode Key)
      const message = `Authorize HabaCoin Profile: ${address}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Get Captcha Token from the Turnstile widget
      const captchaInput = document.getElementsByName('cf-turnstile-response')[0] as HTMLInputElement;
      const captchaToken = captchaInput?.value;

      if (!captchaToken) {
        alert("Please complete the Captcha first!");
        return;
      }

      // Sync with our Netlify Edge Function + Neon DB
      const response = await fetch('/api/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet: address, 
          signature, 
          message,
          captcha: captchaToken 
        })
      });

      if (response.ok) {
        setWalletAddress(address);
        alert("Wallet Successfully Linked to 100B HABA Vault!");
      }
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">
      {/* --- NAVIGATION --- */}
      <nav className="p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg rotate-12 flex items-center justify-center font-black text-black">H</div>
          <span className="text-xl font-black tracking-tighter">HabaCoin</span>
        </div>
        <div data-netlify-identity-menu className="text-sm font-medium"></div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* --- WELCOME & AUTH SECTION --- */}
        {!user ? (
          <section className="py-20 text-center space-y-6">
            <h1 className="text-6xl font-black leading-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
              Global Wealth.<br/>No Gatekeepers.
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              The 100 Billion HABA economy is open. Mine from any device, chat in Ghost Mode, and build your future.
            </p>
            <div className="pt-4">
              <div data-netlify-identity-button className="inline-block bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"></div>
            </div>
          </section>
        ) : (
          <>
            {/* --- USER DASHBOARD --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Wallet & Identity Status */}
              <div className="p-6 bg-gray-900/50 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Identity Vault</h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium">{user.user_metadata?.full_name || user.email}</p>
                  {walletAddress ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                      <p className="text-xs text-green-500 mb-1 uppercase font-bold">Polygon Wallet Linked</p>
                      <p className="text-xs font-mono truncate text-green-400">{walletAddress}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Cloudflare Turnstile Placeholder */}
                      <div className="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>
                      <button 
                        onClick={linkWallet}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
                      >
                        Link Polygon Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Mining Dashboard Component */}
              <MiningDashboard />
            </div>

            {/* --- GHOST MODE CHAT SECTION --- */}
            <section id="ghost-mode" className="pt-6">
              <div className="p-1 text-center mb-4">
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold tracking-widest uppercase">
                  Encrypted Environment
                </span>
              </div>
              <GhostChat />
            </section>
          </>
        )}

        {/* --- GLOBAL STATS FOOTER --- */}
        <footer className="pt-20 pb-10 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Total Supply</p>
            <p className="text-sm font-mono">100,000,000,000</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Protocol</p>
            <p className="text-sm font-mono text-green-500">Polygon</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Ghost Tax</p>
            <p className="text-sm font-mono text-purple-500">2% Burn</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
