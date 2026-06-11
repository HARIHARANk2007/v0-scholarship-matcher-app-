import { NextResponse } from "next/server"
import { Resend } from "resend"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    // Calculate dates: start of day in 7 days to end of day in 7 days
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)
    
    const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999))

    // 1. Fetch scholarships ending in exactly 7 days
    const upcomingScholarships = await db.scholarship.findMany({
      where: {
        deadline: {
          gte: startOfTarget,
          lte: endOfTarget,
        },
      },
    })

    if (upcomingScholarships.length === 0) {
      return NextResponse.json({ message: "No scholarships closing in 7 days.", emailsSent: 0 })
    }

    // 2. Fetch all registered students
    const users = await db.user.findMany()
    let emailsSent = 0

    for (const scholarship of upcomingScholarships) {
      // Find students eligible for this specific scholarship
      const eligibleUsers = users.filter((u: any) => {
        if (scholarship.minPercentage !== null && (u.percentage || 0) < scholarship.minPercentage) return false
        if (scholarship.maxIncome !== null && (u.income || 0) > scholarship.maxIncome) return false
        if (scholarship.categories && scholarship.categories.length > 0 && !scholarship.categories.includes(u.category || "General")) return false
        if (scholarship.states && scholarship.states.length > 0 && u.state && !scholarship.states.includes(u.state)) return false
        if (scholarship.schoolTypes && scholarship.schoolTypes.length > 0 && u.schoolType && !scholarship.schoolTypes.includes(u.schoolType)) return false
        return true
      })

      // Send reminder email to each eligible student
      for (const student of eligibleUsers) {
        if (!student.email) continue

        try {
          await resend.emails.send({
            from: "EduBridge Alerts <onboarding@resend.dev>",
            to: [student.email],
            subject: `⏰ Reminder: ${scholarship.name} Closes in 7 Days!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #dc2626; margin-top: 0;">⏰ Scholarship Deadline Reminder</h2>
                <p>Hello <strong>${student.name || "Student"}</strong>,</p>
                <p>This is a reminder that the scholarship <strong>${scholarship.name}</strong> is closing in <strong>7 days</strong> on ${new Date(scholarship.deadline).toLocaleDateString("en-IN")}.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #1e293b;">Grant Details:</p>
                  <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #10b981;">Amount: ₹${scholarship.amount.toLocaleString("en-IN")}</p>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">${scholarship.description || "No description provided."}</p>
                </div>

                <p>Please log in to your dashboard to complete your auto-filled application preview and download/submit the document package before the closing date.</p>
                
                <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
                
                <hr style="margin: 30px 0 15px; border: 0; border-top: 1px solid #e2e8f0;" />
                <p style="font-size: 11px; color: #94a3b8; margin: 0;">EduBridge App · Staging Environment. You are receiving this notification because you match this program's eligibility checklist.</p>
              </div>
            `,
          })
          emailsSent++
        } catch (emailErr) {
          console.error(`Failed to send deadline email to ${student.email}:`, emailErr)
        }
      }
    }

    return NextResponse.json({ message: "Reminder run finished.", emailsSent })
  } catch (error: any) {
    console.error("Deadline reminder cron error:", error)
    return NextResponse.json({ error: error.message || "Failed to process reminders" }, { status: 500 })
  }
}
