import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * CRON/WORKER ENTRY POINT: POST/GET route to execute scheduled accounting reconciliation
 */
export async function POST(req: Request) {
  try {
    // Security check: Validate secret cron authorization header token if present
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized worker request execution." }, { status: 401 });
    }

    // 1. Pull all completed activity boost sessions not yet accounted for in the purchase queue
    const unallocatedSessions = await sql`
      SELECT abs.id, abs.total_steps
      FROM activity_boost_sessions abs
      LEFT JOIN treasury_purchase_queue tpq ON abs.id = tpq.activity_session_id
      WHERE abs.status = 'completed' AND tpq.id IS NULL
      LIMIT 50; -- Batch processing for maximum resource performance stability
    `;

    if (unallocatedSessions.length === 0) {
      return NextResponse.json({ success: true, message: "Treasury ledger fully reconciled. Zero pending transactions." }, { status: 200 });
    }

    const HABA_PER_100_STEPS = 0.0005;
    const INTENSITY_MULTIPLIER = 2.5;
    let totalHabaAllocatedThisBatch = 0;

    // 2. Transactionally process allocations loop
    for (const session of unallocatedSessions) {
      const grossEarnedTokens = (session.total_steps / 100) * HABA_PER_100_STEPS * INTENSITY_MULTIPLIER;
      const treasuryAllocation = grossEarnedTokens * 0.30; // Strict 30% backing basket allocation policy

      if (treasuryAllocation > 0) {
        // Enqueue the pending macro-order allocation entry
        await sql`
          INSERT INTO treasury_purchase_queue (activity_session_id, allocated_haba_amount, status)
          VALUES (${session.id}, ${treasuryAllocation}, 'pending');
        `;
        totalHabaAllocatedThisBatch += treasuryAllocation;
      }
    }

    // 3. Programmatic Execution Module: Simulating market conversion into backing targets
    const pendingOrders = await sql`
      SELECT id, allocated_haba_amount FROM treasury_purchase_queue WHERE status = 'pending';
    `;

    if (pendingOrders.length > 0) {
      // Pull strategic allocation target criteria mappings
      const assetTargets = await sql`SELECT asset_ticker, target_allocation_pct FROM treasury_basket_assets;`;
      
      // Calculate total batch value to route to order desk pools
      const totalBatchValueToProcess = pendingOrders.reduce((acc, curr) => acc + parseFloat(curr.allocated_haba_amount), 0);

      for (const asset of assetTargets) {
        const percentage = parseFloat(asset.target_allocation_pct) / 100;
        const valueToAllocateToAsset = totalBatchValueToProcess * percentage;

        // Simulate conversion rate mapping (e.g., 1 HABA token values at roughly 0.01 base units)
        const mockConversionRate = 0.01; 
        const accumulatedUnits = valueToAllocateToAsset * mockConversionRate;

        // Update the global vault balance ledger records instantly
        await sql`
          UPDATE treasury_basket_assets
          SET current_held_units = current_held_units + ${accumulatedUnits}
          WHERE asset_ticker = ${asset.asset_ticker};
        `;
      }

      // Mark processed items as completed inside the transaction history bounds
      const orderIds = pendingOrders.map(o => o.id);
      await sql`
        UPDATE treasury_purchase_queue
        SET status = 'processed', processed_at = CURRENT_TIMESTAMP
        WHERE id = ANY(${orderIds});
      `;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        sessionsReconciled: unallocatedSessions.length,
        habaTokensRoutedToTreasury: totalHabaAllocatedThisBatch.toFixed(4)
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fallback GET execution handler for manual verification triggers
export async function GET(req: Request) {
  return POST(req);
}
