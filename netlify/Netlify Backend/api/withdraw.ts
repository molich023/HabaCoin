// Inside your withdrawal API
await sql.begin(async (tx) => {
  // 1. Lock the balance
  const [user] = await tx`UPDATE profiles SET gaming_points_balance = gaming_points_balance - ${amount} WHERE id = ${uid} AND gaming_points_balance >= ${amount} RETURNING *`;
  if (!user) throw new Error("Insufficient funds");

  // 2. Record the pending withdrawal
  await tx`INSERT INTO withdrawals (user_id, amount_haba) VALUES (${uid}, ${amount})`;
});
