import { NextResponse } from "next/server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("Resend API key is not configured")
    }
    const resend = new Resend(apiKey)
    const { email, scholarshipName, deadline } = await req.json()

    if (!email || !scholarshipName || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const deadlineDate = new Date(deadline)
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const isUrgent = daysLeft <= 7

    const formattedDeadline = deadlineDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const { data, error } = await resend.emails.send({
      from: "EduBridge <onboarding@resend.dev>",
      to: [email],
      subject: `⏰ ${isUrgent ? "URGENT: " : ""}${scholarshipName} — ${daysLeft} days left to apply`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af 0%,#7c3aed 100%);border-radius:16px;padding:36px 32px;color:white;margin-bottom:24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🎓</div>
      <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">EduBridge</h1>
      <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Scholarship Deadline Reminder</p>
    </div>
    
    <!-- Body -->
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:16px;">
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">${scholarshipName}</h2>
      <p style="color:#64748b;margin:0 0 24px;font-size:14px;">You set a reminder for this scholarship through EduBridge.</p>
      
      <!-- Countdown Box -->
      <div style="background:${isUrgent ? "#fef2f2" : "#eff6ff"};border:2px solid ${isUrgent ? "#fca5a5" : "#bfdbfe"};border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:32px;">${isUrgent ? "🚨" : "📅"}</div>
          <div>
            <div style="font-size:22px;font-weight:800;color:${isUrgent ? "#dc2626" : "#1d4ed8"};">${daysLeft} days left</div>
            <div style="font-size:13px;color:#64748b;margin-top:2px;">Deadline: ${formattedDeadline}</div>
          </div>
        </div>
      </div>
      
      <!-- Checklist hint -->
      <div style="border-left:4px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#6d28d9;font-weight:600;">📋 Documents typically needed:</p>
        <p style="margin:6px 0 0;font-size:13px;color:#7c3aed;line-height:1.6;">
          Marksheet · Income Certificate · Aadhaar Card · Bank Passbook · Passport Photo · School Bonafide
        </p>
      </div>
      
      <a href="http://localhost:3000/matches" style="display:block;text-align:center;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        Open EduBridge → Apply Now
      </a>
    </div>
    
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:0;">
      EduBridge — Scholarship Matcher for Indian Students<br>
      You received this because you clicked "Remind Me" on EduBridge.
    </p>
  </div>
</body>
</html>`,
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: any) {
    console.error("Reminder email error:", error)
    return NextResponse.json({ error: error.message || "Failed to send reminder" }, { status: 500 })
  }
}
