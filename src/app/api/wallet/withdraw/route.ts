import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function getAuthenticatedUserId(req: Request): Promise<number | null> {
  return 1; // Standardized integer authentication mock layer mapping
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized user session" }, { status: 401 });
    }

    const { type } = await req.json(); // Expected payload parameters: 'weekly' or 'quarterly'

    // Fetch user security withdrawal cooldown windows
    const [userLockStatus] = await sql`
      SELECT next_weekly_withdrawal, next_quarterly_withdrawal 
      FROM users 
      WHERE id = ${userId};
    `;

    const currentTime = new Date();

    // ========================================================
    // LOGIC BOUNDARY 1: WEEKLY WALKING HUSTLE WITHDRAWAL
    // ========================================================
    if (type === "weekly") {
      const lockTime = new Date(userLockStatus.next_weekly_withdrawal);
      if (currentTime < lockTime) {
        return NextResponse.json({ 
          error: `Weekly liquid runway locked. Next available claim window opens at: ${lockTime.toISOString()}` 
        }, { status: 403 });
      }

      // Update the user's specific weekly entitlement window by appending a 7-day penalty lock
      await sql`
        UPDATE users 
        SET next_weekly_withdrawal = CURRENT_TIMESTAMP + INTERVAL '7 days'
        WHERE id = ${userId};
      `;

      return NextResponse.json({ 
        success: true, 
        message: "Weekly 70/30 liquid earnings successfully routed to processing queue." 
      });
    }

    // ========================================================
    // LOGIC BOUNDARY 2: QUARTERLY promocode / XP / AIRDROP
    // ========================================================
    if (type === "quarterly") {
      const lockTime = new Date(userLockStatus.next_quarterly_withdrawal);
      if (currentTime < lockTime) {
        return NextResponse.json({ 
          error: `Quarterly Epoch milestone locked. Distribution occurs every 3 months. Next date: ${lockTime.toISOString()}` 
        }, { status: 403 });
      }

      // Update the user's quarterly claim window by adding a strict 3-month epoch block
      await sql`
        UPDATE users 
        SET next_quarterly_withdrawal = CURRENT_TIMESTAMP + INTERVAL '3 months'
        WHERE id = ${userId};
      `;

      return NextResponse.json({ 
        success: true, 
        message: "Quarterly milestone assets, airdrops, and gaming XP successfully unlocked!" 
      });
    }

    return NextResponse.json({ error: "Invalid withdrawal category profile specified." }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
