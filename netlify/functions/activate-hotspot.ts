import { Handler } from '@netlify/functions';
import { getDb } from './lib/db';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, multiplier, duration } = JSON.parse(event.body || '{}');
    const parsedMultiplier = parseFloat(multiplier);
    const parsedDuration = parseInt(duration, 10);

    if (!name || isNaN(parsedMultiplier) || isNaN(parsedDuration)) {
      return { statusCode: 422, body: 'Missing or corrupted parameters.' };
    }

    const sql = getDb();

    // Persist real-time multiplier activation data directly inside Neon DB
    await sql`
      INSERT INTO hotspots (zone_name, multiplier, duration_seconds, geo_coordinates, activated_at)
      VALUES (${name}, ${parsedMultiplier}, ${parsedDuration}, ARRAY[36.82, -1.29], NOW())
    `;

    /* 
      Architectural Note: Serverless environments cannot sustain long-lived stateful websockets.
      Instead, we write directly to Neon DB and use standard PostgreSQL NOTIFY channels. 
      The front-end client listening via standard pooling layers or serverless event streams 
      instantly pulls down the updated global states.
    */
    await sql`NOTIFY hotspot_alerts, ${JSON.stringify({
      type: "GREEN_ALERT",
      content: `⚠️ GREEN ALERT: ${parsedMultiplier}x Multiplier Active in ${name}!`,
      coords: [36.82, -1.29],
      duration: parsedDuration
    })}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: "Global Hotspot Event Broadcasted." })
    };

  } catch (error: any) {
    console.error("[!] Hotspot Activation Fault:", error.message);
    return { statusCode: 500, body: "Failed to broadcast operational event." };
  }
};
