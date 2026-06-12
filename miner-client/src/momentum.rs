use sha3::{Digest, Sha3_256};
use std::collections::HashMap;

pub struct MomentumMiner {
    pub difficulty: u32,
    pub max_elements: usize, // Explicit element limits to protect hardware states
}

impl MomentumMiner {
    pub fn new(difficulty: u32, memory_gb: usize) -> Self {
        // Hardening Calculation: 1GB safely accommodates roughly 12,000,000 hashed items
        let safe_element_capacity = memory_gb * 12_000_000;
        Self {
            difficulty,
            max_elements: safe_element_capacity,
        }
    }

    pub fn mine(&self, seed: &[u8], salt: &[u8]) -> Option<(u64, u64)> {
        let mut lookup_table: HashMap<Vec<u8>, u64> = HashMap::with_capacity(100_000);
        
        for nonce in 0..u64::MAX {
            let mut hasher = Sha3_256::new();
            hasher.update(seed);
            hasher.update(salt);
            hasher.update(nonce.to_le_bytes());
            let hash = hasher.finalize();

            // 64-bit validation alignment
            let fingerprint = &hash[0..8]; 

            if let Some(&prev_nonce) = lookup_table.get(fingerprint) {
                if prev_nonce != nonce && self.verify_collision(seed, salt, prev_nonce, nonce) {
                    return Some((prev_nonce, nonce));
                }
            }

            lookup_table.insert(fingerprint.to_vec(), nonce);
            
            // Hardening Memory Protection: Defends mobile environments against out-of-memory crashes
            if lookup_table.len() >= self.max_elements {
                console_log("[!] Memory threshold boundary reached. Resetting lookup allocation tables.");
                lookup_table.clear();
            }
        }
        None
    }

    pub fn verify_collision(&self, seed: &[u8], salt: &[u8], n1: u64, n2: u64) -> bool {
        if n1 == n2 { return false; }
        let h1 = self.calculate_hash(seed, salt, n1);
        let h2 = self.calculate_hash(seed, salt, n2);
        h1[0..8] == h2[0..8]
    }

    fn calculate_hash(&self, seed: &[u8], salt: &[u8], nonce: u64) -> Vec<u8> {
        let mut hasher = Sha3_256::new();
        hasher.update(seed);
        hasher.update(salt);
        hasher.update(nonce.to_le_bytes());
        hasher.finalize().to_vec()
    }
}

fn console_log(msg: &str) {
    println!("{}", msg);
}
