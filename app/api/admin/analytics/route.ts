import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const scholarships = await db.scholarship.findMany()
    const now = new Date()

    // 1. Amount distribution buckets
    const amountBuckets = [
      { range: "Under ₹10K", min: 0, max: 9999 },
      { range: "₹10K–25K", min: 10000, max: 24999 },
      { range: "₹25K–50K", min: 25000, max: 49999 },
      { range: "₹50K–1L", min: 50000, max: 99999 },
      { range: "Above ₹1L", min: 100000, max: Infinity },
    ]
    const scholarshipsByAmount = amountBuckets.map(bucket => ({
      range: bucket.range,
      count: scholarships.filter((s: any) => s.amount >= bucket.min && s.amount <= bucket.max).length,
    }))

    // 2. Top 10 tags by frequency
    const tagFrequency: Record<string, number> = {}
    for (const s of scholarships) {
      for (const tag of (s.tags || [])) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      }
    }
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // 3. Deadline timeline — scholarships grouped by deadline month
    const monthMap: Record<string, number> = {}
    for (const s of scholarships) {
      const d = new Date(s.deadline)
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      monthMap[key] = (monthMap[key] || 0) + 1
    }
    
    const parseMonth = (m: string) => {
      const parts = m.split(/[\s,'-]+/).filter(Boolean)
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      if (parts.length >= 2) {
        const monthIndex = months.indexOf(parts[0].toLowerCase())
        let year = parseInt(parts[1], 10)
        if (year < 100) year += 2000
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, 1)
        }
      }
      return new Date(0)
    }

    const deadlineTimeline = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => parseMonth(a.month).getTime() - parseMonth(b.month).getTime())

    // 4. Category eligibility breakdown
    const catMap: Record<string, number> = {}
    for (const s of scholarships) {
      const cats: string[] = (s.categories && s.categories.length > 0)
        ? s.categories
        : ["All Categories"]
      for (const cat of cats) {
        catMap[cat] = (catMap[cat] || 0) + 1
      }
    }
    const CHART_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"]
    const categoryBreakdown = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))

    // 5. School type breakdown
    const schoolTypeMap: Record<string, number> = {}
    for (const s of scholarships) {
      const types: string[] = (s.schoolTypes && s.schoolTypes.length > 0)
        ? s.schoolTypes
        : ["All Types"]
      for (const type of types) {
        schoolTypeMap[type] = (schoolTypeMap[type] || 0) + 1
      }
    }
    const schoolTypeBreakdown = Object.entries(schoolTypeMap).map(([name, count]) => ({ name, count }))

    return NextResponse.json({
      scholarshipsByAmount,
      topTags,
      deadlineTimeline,
      categoryBreakdown,
      schoolTypeBreakdown,
    })
  } catch (error: any) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
