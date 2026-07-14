#!/bin/bash
# ====================================================================
# ⚡ HABACOIN SMART CONTRACT AUTOMATIC OPTIMIZATION GENERATOR
# ====================================================================

echo "🧹 Cleaning previous build artifacts..."
npx hardhat clean

echo "📦 Installing development gas metrics visualization modules..."
npm install --save-dev hardhat-gas-reporter --quiet

echo "⚡ Executing compilation matrix under active Yul optimization flags..."
REPORT_GAS=true npx hardhat compile

if [ $? -eq 0 ]; then
    echo "🚀 SUCCESS: Optimization complete! Check the Gas Report tables for exact fee parameters."
else
    echo "❌ ERROR: Compilation failed during gas analysis phase."
    exit 1
fi
