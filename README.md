HabaCoin (HABA)

> A High-Performance, Mobile-First Web3 Ecosystem Driving Financial Inclusion and Micro-Transactions across Africa.

[![Network: Polygon](https://img.shields.io/badge/Network-Polygon-8247E5?style=flat-square&logo=polygon&logoColor=white)](https://polygon.technology/)
[![Database: Neon DB](https://img.shields.io/badge/Database-Neon_DB-00E599?style=flat-square&logo=postgresql&logoColor=black)](https://neon.tech/)

---

## 📋 Executive Overview

HabaCoin is an open-source, mobile-first Progressive Web App (PWA) designed to transition traditional cash economies into a frictionless, decentralized financial framework. Optimized for lightning-fast execution and near-zero economic barriers, HabaCoin enables seamless peer-to-peer (P2P) utility, simple local business settlement, and micro-incentive systems without complex setup procedures.

By leveraging meta-transactions on the Polygon network, HabaCoin strips away the complex friction of Web3—completely abstracting gas fees for the everyday consumer while retaining cryptographic security and true sovereign asset ownership.

---

## ⚡ Core Pillars & System Architecture

### 1. Gasless P2P Infrastructure (Zero Friction)
HabaCoin employs EIP-2771 meta-transactions. Users securely sign intents locally on their devices, and our relayer infrastructure handles gas fees on the Polygon network. This ensures P2P transactions remain effectively free, fast, and competitive with traditional mobile money networks.

### 2. Hybrid Hybrid Engine (Neon DB + Polygon)
*   **Neon DB Layer:** Serves as a highly responsive caching ledger to provide instant UI/UX feedback for transaction balances.
*   **Polygon Consensus:** Acts as the decentralized immutable settlement layer, ensuring auditability and cryptographically verified finality.

### 3. Virtual Proof-of-Activity (PoA)
HabaCoin moves away from resource-intensive hardware mining. Instead, users participate in an eco-friendly "Proof-of-Activity" system where ecosystem engagement, platform utilization, and organic user onboarding trigger daily cryptographic reward distributions.

---

## 🚀 Technical Quickstart

### Prerequisites
* Node.js v18+
* PostgreSQL client (or Neon DB account)

### Local Configuration
1. Clone the project and install project dependencies:
```bash
   git clone [https://github.com/molich023/habacoin.git](https://github.com/molich023/habacoin.git)
   cd habacoin
   npm install
