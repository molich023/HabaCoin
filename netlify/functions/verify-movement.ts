import { Handler } from '@netlify/functions';
import { getDb } from './lib/db';

// Mathematical implementation of the Haversine formula to compute absolute GPS distances
function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export const handler: Handler = async (event) => {
  try {
    const { userId, startCoord, endCoord, stepCount } = JSON.parse(event.body || '{}');

    if (!userId || !startCoord || !endCoord || typeof stepCount !== 'number') {
      return { statusCode: 400, body: "Invalid telemetry tracking coordinates." };
    }

    const gpsDistance = calculateHaversine(startCoord[1], startCoord[0], endCoord[1], endCoord[0]);
    const stepDistance = stepCount * 0.75; // Baseline human stride step constant
    
    // Cross-check GPS tracking against the physical mechanical stride metrics
    const drift = Math.abs(gpsDistance - stepDistance);
    const isSuspicious = drift > (gpsDistance * 0.20); // 20% validation boundary cap

    if (isSuspicious) {
      const sql = getDb();
      await sql`
        INSERT INTO admin_audit_reports (user_id, event_type, security_score, is_suspicious, device_data)
        VALUES (${userId}, 'MOVEMENT_SPOOF_ATTEMPT', 10, true, ${JSON.stringify({ drift, gpsDistance, stepDistance })})
      `;
      return { statusCode: 403, body: "Sensor Discordance Detected: Tracking metrics unaligned." };
    }

    const sql = getDb();
    const distanceInKm = gpsDistance / 1000;

    // Use pure numeric bindings to update user profiles safely
    await sql`
      UPDATE profiles 
      SET total_distance_km = total_distance_km + ${distanceInKm} 
      WHERE id = ${userId}
    `;
  
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, kmVerified: distanceInKm })
    };

  } catch (error: any) {
    console.error("[!] Telemetry Tracking Process Exception:", error.message);
    return { statusCode: 500, body: "Tracking metrics computation fault." };
  }
};
