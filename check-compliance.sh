#!/bin/bash
# ====================================================================
# 🛡️ HABACOIN FLOSS COMPLIANCE AUTOMATED ENVIRONMENT MONITOR
# ====================================================================

echo "🔍 Phase 1: Installing Lightweight Open-Source License Auditor..."
npm install -g license-checker --quiet

echo "📊 Phase 2: Analyzing Layer 2 Dependencies and License Allocation..."
# Scans all node_modules packages to ensure no restrictive licenses (like AGPL) slipped in
license-checker --production --summary

echo "🛡️ Phase 3: Executing Permissive Validation Check..."
# Fails the script if a dependency breaks common permissive open-source models (MIT, Apache-2.0, BSD)
license-checker --production --onlyAllow "MIT; Apache-2.0; BSD-2-Clause; BSD-3-Clause; ISC; CC-BY-4.0" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: All dependencies comply completely with the FLOSS standard!"
    exit 0
else
    echo "❌ ALARM: Non-compliant copyleft licenses detected in package-lock tracking!"
    license-checker --production --summary | grep -E "GPL|AGPL"
    exit 1
fi
