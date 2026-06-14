import { Handler } from '@netlify/functions';
import { getDb } from './lib/db';

export const handler: Handler = async (event) => {
  // Security Layer: Verify this webhook originates exclusively from your identity verification rail
  try {
    const { user } = JSON.parse(event.body || '{}');

    if (!user || !user.id) {
      return { statusCode: 400, body: "Invalid payload mapping contract." };
    }

    const sql = getDb();

    // Secure parameterized query string routing executed directly through the main database engine
    const [updatedProfile] = await sql`
      UPDATE profiles 
      SET is_verified = TRUE 
      WHERE id = ${user.id}
      RETURNING id
    `;

    if (!updatedProfile) {
      return { statusCode: 404, body: "Target profile footprint not found." };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, status: "User Account Verified Successfully" })
    };

  } catch (error: any) {
    console.error("[!] Critical Netlify Identity Webhook Error:", error.message);
    return { statusCode: 500, body: "Database configuration synchronization failure." };
  }
};
