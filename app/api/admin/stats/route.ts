import { NextResponse } from "next/server"
import db from "@/lib/db"
import { scholarshipsData } from "@/lib/scholarships-data"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const scholarships = await db.scholarship.findMany()
    const users = await db.user.findMany()

    // Total amount available across all scholarships
    const totalAmountAvailable = scholarships.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

    // Tag frequency for "most popular" scholarships
    const tagFrequency: Record<string, number> = {}
    for (const s of scholarships) {
      for (const tag of (s.tags || [])) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      }
    }
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    // Deadline urgency breakdown
    const now = new Date()
    let expiringSoon = 0
    let expiredCount = 0
    for (const s of scholarships) {
      const d = new Date(s.deadline)
      const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0) expiredCount++
      else if (daysLeft <= 30) expiringSoon++
    }

    // Amount range buckets for quick display
    const highValue = scholarships.filter((s: any) => s.amount >= 50000).length
    const avgAmount = scholarships.length > 0 ? Math.round(totalAmountAvailable / scholarships.length) : 0

    return NextResponse.json({
      totalScholarships: scholarships.length,
      totalRegisteredStudents: users.length,
      totalAmountAvailable,
      avgAmount,
      highValueScholarships: highValue,
      expiringSoon,
      expiredCount,
      topTags,
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
