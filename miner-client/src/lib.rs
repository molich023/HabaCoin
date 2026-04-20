use wasm_bindgen::prelude::*;
use sha3::{Digest, Sha3_256};
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct MiningResult {
    pub nonce1: u64,
    pub nonce2: u64,
    pub difficulty: u32,
}

#[wasm_bindgen]
pub fn run_momentum_hustle(seed: &[u8], difficulty: u32) -> JsValue {
    let mut lookup: std::collections::HashMap<Vec<u8>, u64> = std::collections::HashMap::new();
    
    for nonce in 0..10_000_000 { // Small batches for browser stability
        let mut hasher = Sha3_256::new();
        hasher.update(seed);
        hasher.update(nonce.to_le_bytes());
        let hash = hasher.finalize();

        let fingerprint = hash[0..4].to_vec(); // 32-bit collision for mobile speed

        if let Some(&prev_nonce) = lookup.get(&fingerprint) {
            let res = MiningResult { nonce1: prev_nonce, nonce2: nonce, difficulty };
            return serde_wasm_bindgen::to_value(&res).unwrap();
        }
        lookup.insert(fingerprint, nonce);
    }
    JsValue::NULL
}
