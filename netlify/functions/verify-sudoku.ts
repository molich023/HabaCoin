import { Handler } from '@netlify/functions';
import { getDb } from './lib/db';

interface GameMove {
  t: number; // Timestamp metric tracking individual placement events
}

export const handler: Handler = async (event) => {
  try {
    const { userId, solveTimeSeconds, moves } = JSON.parse(event.body || '{}') as { userId: string, solveTimeSeconds: number, moves: GameMove[] };

    const HUMAN_MIN_TIME = 120; // 2 minutes threshold cap boundary rules
    let isSuspicious = false;
    let reason = "CLEAN";

    // Validation Check 1: Inhuman solution pacing
    if (solveTimeSeconds < HUMAN_MIN_TIME) {
      isSuspicious = true;
      reason = "INHUMAN_SPEED";
    }

    // Validation Check 2: Pattern Entropy Analysis to spot mechanical bot play styles
    if (Array.isArray(moves) && moves.length > 20) {
      const intervals: number[] = [];
      for (let i = 1; i < moves.length; i++) {
        intervals.push(moves[i].t - moves[i - 1].t);
      }
      
      const uniqueIntervals = new Set(intervals.filter(timeDelta => timeDelta > 0)).size;
      
      // A human solver exhibits input variation. Perfectly uniform time deltas reveal an active script.
      if (uniqueIntervals < 5) {
        isSuspicious = true;
        reason = "BOT_RHYTHM_DETECTED";
      }
    } else {
      isSuspicious = true;
      reason = "INSUFFICIENT_TELEMETRY_LOGS";
    }

    const sql = getDb();

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO admin_audit_reports (user_id, event_type, security_score, is_suspicious, device_data)
        VALUES (${userId}, 'SUDOKU_WIN', ${isSuspicious ? 10 : 100}, ${isSuspicious}, ${JSON.stringify({ reason, solveTimeSeconds })})
      `;

      if (isSuspicious) {
        // Enforce an operational shadow ban without alerting the bot client
        await tx`UPDATE profiles SET is_flagged = TRUE WHERE id = ${userId}`;
      } else {
        // Issue payout confirmation only after passing all verification stages
        await tx`UPDATE profiles SET gaming_points_balance = gaming_points_balance + 50 WHERE id = ${userId}`;
      }
    });

    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: !isSuspicious, rewardSent: !isSuspicious }) 
    };

  } catch (error: any) {
    console.error("[!] Anti-Cheat Script Pipeline Failure:", error.message);
    return { statusCode: 500, body: "Score processing pipeline failure." };
  }
};
