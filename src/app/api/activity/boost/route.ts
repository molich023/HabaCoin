import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function getAuthenticatedUserId(req: Request): Promise<number | null> {
  // Production auth placeholder matching integer ID parsing
  return 1; 
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const existingActive = await sql`
      SELECT id FROM activity_boost_sessions 
      WHERE user_id = ${userId} AND status = 'active' 
      LIMIT 1;
    `;

    if (existingActive.length > 0) {
      return NextResponse.json(
        { error: "An active Hustle Mode session is already in progress." },
        { status: 400 }
      );
    }

    const [session] = await sql`
      INSERT INTO activity_boost_sessions (user_id, status)
      VALUES (${userId}, 'active')
      RETURNING id, activated_at, multiplier;
    `;

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { steps, distanceKm, avgSpeedKmh, coordinates } = await req.json();

    if (!coordinates || !Array.isArray(coordinates)) {
      return NextResponse.json({ error: "Missing physical route map telemetry coordinates." }, { status: 400 });
    }

    const activeSession = await sql`
      SELECT id FROM activity_boost_sessions 
      WHERE user_id = ${userId} AND status = 'active'
      LIMIT 1;
    `;

    if (activeSession.length === 0) {
      return NextResponse.json({ error: "No active session found to conclude." }, { status: 404 });
    }

    const sessionId = activeSession[0].id;

    const [updatedSession] = await sql`
      UPDATE activity_boost_sessions
      SET 
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        total_steps = ${steps},
        total_distance_km = ${distanceKm},
        average_speed_kmh = ${avgSpeedKmh},
        path_coordinates = ${JSON.stringify(coordinates)}::jsonb
      WHERE id = ${sessionId}
      RETURNING *;
    `;

    const HABA_PER_100_STEPS = 0.0005; 
    const INTENSITY_MULTIPLIER = 2.5;
    
    const grossEarnedTokens = (steps / 100) * HABA_PER_100_STEPS * INTENSITY_MULTIPLIER;
    const userWithdrawableShare = grossEarnedTokens * 0.70;
    const treasuryRetainedShare = grossEarnedTokens * 0.30;

    const shareMessage = `🎯 Just crushed a high-intensity session on HabaCoin! 🏃💨\n\n` +
                         `📏 Distance: ${distanceKm} KM\n` +
                         `⚡ Avg Speed: ${avgSpeedKmh} KM/H\n` +
                         `👟 Steps: ${steps}\n\n` +
                         `Every step backs our global treasury reserve asset pool. In Truth We Hustle! 🧵💎\n` +
                         `Join the movement: habacoin.netlify.app`;

    const encodedText = encodeURIComponent(shareMessage);
    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://habacoin.netlify.app&quote=${encodedText}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`
    };

    return NextResponse.json({
      success: true,
      summary: {
        ...updatedSession,
        financials: {
          grossEarnedTokens: grossEarnedTokens.toFixed(4),
          userWithdrawableShare: userWithdrawableShare.toFixed(4),
          treasuryRetainedShare: treasuryRetainedShare.toFixed(4)
        },
        shareLinks
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
