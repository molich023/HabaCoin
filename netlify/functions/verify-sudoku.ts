export async function handler(event) {
  const { userId, solveTimeSeconds, difficulty, moves } = JSON.parse(event.body);

  // 1. Define the "Biological Limit" (2 Minutes = 120s)
  const HUMAN_MIN_TIME = 120; 
  let isSuspicious = false;
  let reason = "CLEAN";

  // Check 1: Speed check
  if (solveTimeSeconds < HUMAN_MIN_TIME) {
    isSuspicious = true;
    reason = "INHUMAN_SPEED";
  }

  // Check 2: Pattern Rhythm (Entropy check)
  // If the time between every move is identical, it's a script.
  const intervals = moves.map((m, i, arr) => i > 0 ? m.t - arr[i-1].t : 0);
  const uniqueIntervals = new Set(intervals.filter(i => i > 0)).size;
  
  if (uniqueIntervals < 5 && moves.length > 20) {
    isSuspicious = true;
    reason = "BOT_RHYTHM_DETECTED";
  }

  // 2. Log to Audit Table and update Profile
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO admin_audit_reports (user_id, event_type, security_score, is_suspicious, device_data)
      VALUES (${userId}, 'SUDOKU_WIN', ${isSuspicious ? 10 : 100}, ${isSuspicious}, ${JSON.stringify({reason, solveTimeSeconds})})
    `;

    if (isSuspicious) {
      // Flag the user profile but DON'T tell them yet (Shadow Ban)
      await tx`UPDATE profiles SET is_flagged = TRUE WHERE id = ${userId}`;
    } else {
      // Pay the reward if clean
      await tx`UPDATE profiles SET gaming_points_balance = gaming_points_balance + 50 WHERE id = ${userId}`;
    }
  });

  return { 
    statusCode: 200, 
    body: JSON.stringify({ success: !isSuspicious, rewardSent: !isSuspicious }) 
  };
}
