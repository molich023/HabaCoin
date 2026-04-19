use sha3::{Digest, Sha3_256};
use std::collections::HashMap;

pub struct MomentumMiner {
    pub difficulty: u32,
    pub memory_size: usize, // e.g., 1GB in bytes
}

impl MomentumMiner {
    pub fn new(difficulty: u32, memory_gb: usize) -> Self {
        Self {
            difficulty,
            memory_size: memory_gb * 1024 * 1024 * 1024,
        }
    }

    /// Finds a birthday collision based on a block seed
    /// This is the core 'Hustle' work
    pub fn mine(&self, seed: &[u8]) -> Option<(u64, u64)> {
        let mut lookup_table: HashMap<Vec<u8>, u64> = HashMap::with_capacity(1000000);
        
        for nonce in 0..u64::MAX {
            let mut hasher = Sha3_256::new();
            hasher.update(seed);
            hasher.update(nonce.to_le_bytes());
            let hash = hasher.finalize();

            // We only look at a subset of the hash bits to find collisions
            let fingerprint = &hash[0..8]; 

            if let Some(&prev_nonce) = lookup_table.get(fingerprint) {
                // Collision found! Verify the 'Momentum'
                if self.verify_collision(seed, prev_nonce, nonce) {
                    return Some((prev_nonce, nonce));
                }
            }

            lookup_table.insert(fingerprint.to_vec(), nonce);
            
            // Memory Hardness Check: If memory limit reached, we reset or adjust
            if lookup_table.len() * 64 > self.memory_size {
                lookup_table.clear();
            }
        }
        None
    }

    pub fn verify_collision(&self, seed: &[u8], n1: u64, n2: u64) -> bool {
        let h1 = self.calculate_hash(seed, n1);
        let h2 = self.calculate_hash(seed, n2);
        
        // Ensure they are not the same nonce but produce the same fingerprint
        n1 != n2 && h1[0..8] == h2[0..8]
    }

    fn calculate_hash(&self, seed: &[u8], nonce: u64) -> Vec<u8> {
        let mut hasher = Sha3_256::new();
        hasher.update(seed);
        hasher.update(nonce.to_le_bytes());
        hasher.finalize().to_vec()
    }
}
