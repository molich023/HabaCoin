import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Tally passes data wrapped inside an event body payload
  const { data } = req.body;
  
  // Extract user-entered email and account parameters from fields
  const userEmailField = data?.find((field: any) => field.type === "email");
  const userAddressField = data?.find((field: any) => field.name?.toLowerCase().includes("address"));
  
  const rawEmail = userEmailField?.value;
  const userAddress = userAddressField?.value || "0x0000000000000000000000000000000000000000";

  if (!rawEmail) {
    return res.status(400).json({ error: "No target processing email submitted." });
  }

  try {
    // 🛡️ CRITICAL GATE: Query Abstract API verification network array
    // Sign up for free at abstractapi.com to get your key
    const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;
    
    const checkTarget = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${rawEmail}`
    );
    const verification = await checkTarget.json();

    // Structural Filter Rules
    const isDisposable = verification.is_disposable_address?.value === true;
    const isDeliverable = verification.deliverability === "DELIVERABLE";
    const mxRecordsValid = verification.is_mx_found?.value === true;
    const lowQualityScore = Number(verification.quality_score || 1) < 0.70; // Filter sketchy/fresh domains

    if (isDisposable || !isDeliverable || !mxRecordsValid || lowQualityScore) {
      console.warn(`🛑 Automated Block: Input [${rawEmail}] flagged as temporary or unauthentic fake lead.`);
      return res.status(403).json({ error: "Submission rejected: Invalid account authenticity validation." });
    }

    // 🏆 STEP 3: Passed verification! Forward directly to our authoritative reward framework
    // Here we make an internal secure call or trigger our asset mint ledger
    console.log(`✅ Success: Email [${rawEmail}] verified as authentic human domain.`);
    
    // Connect to your database context layout:
    // await db.users.create({ email: rawEmail, wallet: userAddress, points: 10 })

    return res.status(200).json({
      success: true,
      status: "Verified",
      message: "Genesis reward slot registered successfully."
    });

  } catch (error) {
    console.error("Verification engine runtime exception:", error);
    return res.status(500).json({ error: "Failed to resolve domain network synchronization checks." });
  }
}
