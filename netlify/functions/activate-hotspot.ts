import { socket } from "./lib/socket-server" 

export async function handler(event) {
  const { name, multiplier, duration } = JSON.parse(event.body);

  // 1. Save to Neon DB
  await sql`INSERT INTO hotspots ...`;

  // 2. The Global Broadcast
  io.emit("system_message", {
    type: "GREEN_ALERT",
    content: `⚠️ GREEN ALERT: ${multiplier}x Multiplier Active in ${name}!`,
    coords: [36.82, -1.29], // Center of the zone
    duration: duration
  });

  return { statusCode: 200 };
}
