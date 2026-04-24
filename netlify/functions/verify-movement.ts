export async function handler(event) {
  const { userId, startCoord, endCoord, stepCount, timeElapsed } = JSON.parse(event.body);

  const gpsDistance = calculateHaversine(startCoord, endCoord); // in meters
  const stepDistance = stepCount * 0.75; // Approx 0.75m per step
  
  // Security: Check if GPS and Steps agree (within 20% margin)
  const drift = Math.abs(gpsDistance - stepDistance);
  const isSuspicious = drift > (gpsDistance * 0.20);

  if (isSuspicious) {
    await logAudit(userId, 'MOVEMENT_SPOOF_ATTEMPT', { drift, gpsDistance, stepDistance });
    return { statusCode: 403, body: "Sensor Discordance Detected" };
  }

  // Update Neon DB
  const km = (gpsDistance / 1000).toFixed(2);
  await sql`UPDATE profiles SET total_distance_km = total_distance_km + ${km} WHERE id = ${userId}`;
  
  return { statusCode: 200, body: `Success: ${km}km verified.` };
}
