import { Handler } from '@netlify/functions';
import { getDb } from './lib/db';

interface RelayLog {
  userId: string;
  hash: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { relayLogs } = JSON.parse(event.body || '{}') as { relayLogs: RelayLog[] };

    if (!Array.isArray(relayLogs) || relayLogs.length === 0) {
      return { statusCode: 422, body: "Malformed logs input structural matrix." };
    }

    // Security Guardrail: Prevent huge payload arrays from blocking connection pools
    if (relayLogs.length > 100) {
      return { statusCode: 413, body: "Payload volume exceeds the processing batch cap (Max: 100)." };
    }

    const sql = getDb();

    await sql.begin(async (tx) => {
      for (const log of relayLogs) {
        if (!log.userId || !log.hash) continue;

        // 1. Insert packet log into database if it doesn't already exist
        const insertResult = await tx`
          INSERT INTO mesh_relays (relay_node_id, packet_hash, captured_at) 
          VALUES (${log.userId}, ${log.hash}, NOW())
          ON CONFLICT (packet_hash) DO NOTHING
          RETURNING id
        `;

        // 2. Only reward the node if this is the first time this log is being registered
        if (insertResult.length > 0) {
          await tx`
            UPDATE profiles 
            SET mesh_reputation_score = mesh_reputation_score + 1,
                gaming_points_balance = gaming_points_balance + 0.05
            WHERE id = ${log.userId}
          `;
        }
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: "Mesh Sync Finalized." })
    };

  } catch (error: any) {
    console.error("[!] Mesh Sync Verification Failure:", error.message);
    return { statusCode: 500, body: "Mesh synchronization process aborted." };
  }
};
