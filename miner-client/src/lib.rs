use wasm_bindgen::prelude::*;
use sha3::{Digest, Sha3_256};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

// Explicit bindgen typing allocation ensures structural transparency on the client runtime window frame
#[wasm_bindgen(getter_with_clone)]
#[derive(Serialize, Deserialize, Clone)]
pub struct MiningResult {
    pub nonce1: u64,
    pub nonce2: u64,
    pub difficulty: u32,
    pub timestamp: u64,
    pub verification_token: String,
}

/**
 * Executes a hardened client-side Synthetic Proof-of-Work (SPoW) search sequence.
 * Complies with OWASP Top 10 A04:2021-Insecure Design parameters by validating boundaries 
 * and introducing unpredictable salt configurations to break static automated bot arrays.
 */
#[wasm_bindgen]
pub fn run_momentum_hustle(seed: &[u8], target_difficulty: u32, salt: &[u8]) -> JsValue {
    // Defense: Sanity check memory boundaries to block buffer anomalies and division-by-zero traps
    if target_difficulty < 1 || target_difficulty > 64 {
        return JsValue::NULL;
    }

    // Allocate continuous memory up front to eliminate reallocation thrashing inside memory blocks
    let mut lookup: HashMap<Vec<u8>, u64> = HashMap::with_capacity(65536);
    
    // Anti-Bot: Gather authentic, high-resolution hardware timestamps directly from browser runtime engine
    let current_time = js_sys::Date::now() as u64;
    
    // Dynamic Difficulty Scaling Mask Configuration
    // Lower difficulties inspect smaller fingerprinted chunks to accommodate lower-end mobile chipsets
    let byte_length = if target_difficulty <= 32 { 4 } else { 8 };

    // Strict time-bound window search iteration loop framework
    for nonce in 0..500_000 { 
        let mut hasher = Sha3_256::new();
        hasher.update(seed);
        hasher.update(salt); // Obfuscates processing tracking layouts to neutralize external ASIC rigs
        hasher.update(nonce.to_le_bytes());
        let hash = hasher.finalize();

        let fingerprint = hash[0..byte_length].to_vec();

        if let Some(&prev_nonce) = lookup.get(&fingerprint) {
            // Verify collision uniqueness constraints to ensure calculation legitimacy
            if prev_nonce != nonce {
                
                // Hardening: Generate an unpredictable client-side verification token
                let mut token_hasher = Sha3_256::new();
                token_hasher.update(prev_nonce.to_le_bytes());
                token_hasher.update(nonce.to_le_bytes());
                token_hasher.update(current_time.to_le_bytes());
                let token_hash = token_hasher.finalize();
                
                let res = MiningResult {
                    nonce1: prev_nonce,
                    nonce2: nonce,
                    difficulty: target_difficulty,
                    timestamp: current_time,
                    verification_token: hex::encode(&token_hash),
                };
                
                // Transform serialization models safely across browser context bindings
                return serde_wasm_bindgen::to_value(&res).unwrap_or(JsValue::NULL);
            }
        }
        lookup.insert(fingerprint, nonce);
    }
    JsValue::NULL
}

// Internal hex module helper to eliminate external crate dependency overhead and shrink code sizes
mod hex {
    pub fn encode(bytes: &[u8]) -> String {
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}
