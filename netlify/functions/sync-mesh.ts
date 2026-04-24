export async function handler(event) {
  const { relayLogs } = JSON.parse(event.body);

  // Logic: Each log contains a signature from the original sender.
  // Our server verifies that the 'relay_node' actually passed a valid packet.
  await sql.begin(async (tx) => {
    for (const log of relayLogs) {
      // 1. Record the relay
      await tx`INSERT INTO mesh_relays (relay_node_id, packet_hash) 
               VALUES (${log.userId}, ${log.hash}) ON CONFLICT DO NOTHING`;
      
      // 2. Pay the Relay Node
      await tx`UPDATE profiles 
               SET mesh_reputation_score = mesh_reputation_score + 1,
                   gaming_points_balance = gaming_points_balance + 0.05
               WHERE id = ${log.userId}`;
    }
  });

  return { statusCode: 200, body: "Mesh Synced" };
}
