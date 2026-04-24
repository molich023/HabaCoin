export async function resolveMatch(player1Id: string, player2Id: string, winnerId: string, stake: number) {
  // 1. Calculate Reward (90% to winner, 10% burned)
  const prize = stake * 1.9; 

  // 2. Neon DB Transaction: Update both accounts in one shot
  await sql.begin(async (tx) => {
    // Deduct from loser
    const loserId = winnerId === player1Id ? player2Id : player1Id;
    await tx`UPDATE profiles SET gaming_points_balance = gaming_points_balance - ${stake} WHERE id = ${loserId}`;
    
    // Add to winner
    await tx`UPDATE profiles SET gaming_points_balance = gaming_points_balance + ${prize} WHERE id = ${winnerId}`;
    
    // Log the match for transparency
    await tx`INSERT INTO match_history (winner_id, loser_id, prize) VALUES (${winnerId}, ${loserId}, ${prize})`;
  });

  return { status: "PAID", winner: winnerId };
}
