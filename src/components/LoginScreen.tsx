import React, { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "altcha"; // Import self-hosted Proof-of-Work engine

interface LoginProps {
  onBiometricLogin: () => void;
}

export const HabaLoginScreen: React.FC<LoginProps> = ({ onBiometricLogin }) => {
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [securityToken, setSecurityToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // High-Availability Engine: 'hcaptcha' or 'altcha' fallback
  const [activeProtection, setActiveProtection] = useState<"hcaptcha" | "altcha">("hcaptcha");
  
  const captchaRef = useRef<HCaptcha>(null);
  const altchaRef = useRef<HTMLElement>(null);

  // Monitor hCaptcha loading. If it takes over 3.5 seconds, trigger ALTCHA fallback
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (activeProtection === "hcaptcha" && !captchaRef.current) {
        console.warn("⚠️ hCaptcha connection timeout. Swapping to Altcha backup rail...");
        setActiveProtection("altcha");
      }
    }, 3500);

    return () => clearTimeout(fallbackTimer);
  }, [activeProtection]);

  // Handle Altcha custom event verification signatures
  useEffect(() => {
    const handleAltchaState = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.state === "verified" || customEvent.detail?.payload) {
        setSecurityToken(customEvent.detail.payload);
        setErrorMessage("");
      } else {
        setSecurityToken(null);
      }
    };

    const currentAltchaNode = altchaRef.current;
    if (currentAltchaNode) {
      currentAltchaNode.addEventListener("statechange", handleAltchaState);
    }

    return () => {
      if (currentAltchaNode) {
        currentAltchaNode.removeEventListener("statechange", handleAltchaState);
      }
    };
  }, [activeProtection]);

  const handleLoginClick = () => {
    if (!hasConsented) {
      setErrorMessage("Tafadhali kubali Masharti na Sera kabla ya kuendelea.");
      return;
    }
    if (!securityToken) {
      setErrorMessage("Tafadhali kamilisha thibitisho la usalama hapa chini.");
      return;
    }
    
    setErrorMessage("");
    onBiometricLogin(); // Execute secure Web3Auth Passkey pipeline
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 font-sans select-none">
      
      {/* Branding Header Block */}
      <div className="mb-8 text-center secure-touch-surface">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          HabaCoin
        </h1>
        <p className="text-neutral-400 text-sm mt-2 font-medium tracking-wide">
          Hustle Safe • Save in Solid Silver
        </p>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        
        {/* Consent/Compliance Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mb-6 secure-touch-surface">
          <input 
            type="checkbox" 
            checked={hasConsented} 
            onChange={(e) => setHasConsented(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0 accent-emerald-500 transition-all cursor-pointer"
          />
          <span className="text-xs text-neutral-300 leading-relaxed">
            I explicitly consent that I have read and agree to the active{" "}
            <a href="/terms" target="_blank" className="text-emerald-400 underline hover:text-emerald-300">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" className="text-emerald-400 underline hover:text-emerald-300">Privacy Policy</a>.
          </span>
        </label>

        {/* Dynamic Multi-Channel Protection Window Container */}
        <div className="my-5 flex justify-center overflow-hidden rounded-xl bg-neutral-950/40 p-2 border border-neutral-800/60 secure-touch-surface min-h-[80px] items-center">
          
          {activeProtection === "hcaptcha" ? (
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => {
                setSecurityToken(token);
                setErrorMessage("");
              }}
              onExpire={() => setSecurityToken(null)}
              onError={() => {
                console.error("hCaptcha failed. Triggering Altcha backup system dynamically.");
                setActiveProtection("altcha");
              }}
              theme="dark"
            />
          ) : (
            /* Self-Hosted Altcha Web Component Interface */
            <altcha-widget
              ref={altchaRef}
              challengeurl="/api/altcha"
              theme="dark"
              hidecredits="true"
              style={{ width: "100%", '--altcha-max-width': '100%' } as React.CSSProperties}
            ></altcha-widget>
          )}

        </div>

        {/* Manual Tweak Switch for Testing or Savvy Users */}
        <div className="text-right mb-4">
          <button 
            type="button"
            onClick={() => {
              setSecurityToken(null);
              setActiveProtection(prev => prev === "hcaptcha" ? "altcha" : "hcaptcha");
            }}
            className="text-[10px] text-neutral-500 hover:text-emerald-400 transition-colors underline"
          >
            Switch to {activeProtection === "hcaptcha" ? "Altcha Engine" : "hCaptcha Engine"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-red-400 text-xs text-center font-semibold my-3 bg-red-950/30 border border-red-900/40 p-3 rounded-xl animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handleLoginClick}
          disabled={!hasConsented || !securityToken}
          className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 transform active:scale-98 secure-touch-surface ${
            hasConsented && securityToken
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 shadow-xl shadow-emerald-950/40" 
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-40"
          }`}
        >
          🔐 Log In via Biometric Passkey
        </button>
      </div>
    </div>
  );
};
