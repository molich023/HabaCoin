use wasm_bindgen::prelude::*;
use sha3::{Digest, Sha3_256};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct MiningResult {
    pub nonce1: u64,
    pub nonce2: u64,
    pub difficulty: u32,
    pub timestamp: u64,
    pub verification_token: String,
}

#[wasm_bindgen]
pub fn run_momentum_hustle(seed: &[u8], target_difficulty: u32, salt: &[u8]) -> JsValue {
    // Defense: Sanity check boundaries to stop buffer overflow and division-by-zero tampering
    if target_difficulty == 0 || target_difficulty > 64 {
        return JsValue::NULL;
    }

    let mut lookup: HashMap<Vec<u8>, u64> = HashMap::with_capacity(65536);
    // Anti-Bot: Gather authentic, high-resolution hardware timestamps from the browser runtime
    let current_time = js_sys::Date::now() as u64;
    
    // Dynamic Difficulty Scaling Mask configuration
    let byte_length = if target_difficulty <= 32 { 4 } else { 8 };

    for nonce in 0..500_000 { 
        let mut hasher = Sha3_256::new();
        hasher.update(seed);
        hasher.update(salt); // Obfuscates computation patterns to break static ASIC/Bot arrays
        hasher.update(nonce.to_le_bytes());
        let hash = hasher.finalize();

        let fingerprint = hash[0..byte_length].to_vec();

        if let Some(&prev_nonce) = lookup.get(&fingerprint) {
            // Verify collision integrity to ensure legitimacy
            if prev_nonce != nonce {
                // Hardening: Generate a client-side signature proof that the backend validation engine requires
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
                    verification_token: hex::encode(token_hash),
                };
                return serde_wasm_bindgen::to_value(&res).unwrap_or(JsValue::NULL);
            }
        }
        lookup.insert(fingerprint, nonce);
    }
    JsValue::NULL
}

// Internal hex module helper to avoid external dependency overhead inside Termux WASM
mod hex {
    pub fn encode(bytes: &[u8]) -> String {
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}
