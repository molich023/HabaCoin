import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple authorization pass linking this cron route to your background worker system
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized operational access.' });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || '';
    if (!databaseUrl) throw new Error('System environment DATABASE_URL string is completely missing.');
    const sql = neon(databaseUrl);

    // 1. Fetch any new, un-notified privilege alerts trapped by the event trigger
    const freshAlerts = await sql`
      SELECT id, command_tag, executed_by, query_text, created_at 
      FROM system_security_alerts 
      WHERE is_notified = FALSE 
      LIMIT 5;
    `;

    if (freshAlerts.length === 0) {
      return res.status(200).json({ status: 'Database pristine. No escalation traces recorded.' });
    }

    // 2. Loop through and dispatch an immediate emergency summary email to the CTO
    for (const alert of freshAlerts) {
      await resend.emails.send({
        from: 'Haba Security <alerts@yourdomain.com>',
        to: 'molich60@gmail.com',
        subject: `⚠️ CRITICAL: HabaCoin Database Privilege Alteration Detected!`,
        html: `
          <div style="font-family: monospace; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 8px;">
            <h3 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">[🚨 SECURITY RISK INCIDENT ADVISORY]</h3>
            <p>An unexpected structural privilege execution was attempted on your production database instance.</p>
            <hr style="border: 0; border-top: 1px solid #334155;" />
            <p><strong>Action Executed:</strong> <span style="color: #f59e0b;">${alert.command_tag}</span></p>
            <p><strong>Executed By Role:</strong> <span style="color: #38bdf8;">${alert.executed_by}</span></p>
            <p><strong>Raw Payload Command:</strong></p>
            <pre style="background-color: #1e293b; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #475569;"><code>${alert.query_text}</code></pre>
            <p><strong>Timestamp:</strong> ${alert.created_at}</p>
            <hr style="border: 0; border-top: 1px solid #334155;" />
            <p style="color: #94a3b8; font-size: 12px;">Please review your Neon connection keys and roll credentials immediately if this operation was not initiated by an internal systems engineer.</p>
          </div>
        `
      });

      // 3. Flag as notified so you aren't spammed for the same historical incident row twice
      await sql`
        UPDATE system_security_alerts SET is_notified = TRUE WHERE id = ${alert.id};
      `;
    }

    return res.status(200).json({ success: true, alerts_processed: freshAlerts.length });

  } catch (error: any) {
    console.error('🚨 Breach Notification Pipeline Error:', error.message);
    return res.status(500).json({ error: 'Failed to process infrastructure alerts.' });
  }
}
