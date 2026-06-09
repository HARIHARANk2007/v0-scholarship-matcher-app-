import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      percentage = 80, 
      income = 250000, 
      category = "General", 
      state = "Tamil Nadu", 
      schoolType = "Govt Aided" 
    } = body

    const userPct = parseFloat(percentage)
    const userInc = parseInt(income)

    let scholarships: any[] = []

    // 1. Query the DB using SQL (if DATABASE_URL is set) or fallback to Prisma mock client
    if (process.env.DATABASE_URL) {
      console.log("🔍 Querying PostgreSQL using SQL...")
      
      // SQL query to filter scholarships the student qualifies for
      const sqlQuery = `
        SELECT * FROM "Scholarship"
        WHERE ("minPercentage" IS NULL OR $1 >= "minPercentage")
          AND ("maxIncome" IS NULL OR $2 <= "maxIncome")
          AND (
            "categories" IS NULL 
            OR array_length("categories", 1) IS NULL 
            OR $3 = ANY("categories")
          )
          AND (
            "states" IS NULL 
            OR array_length("states", 1) IS NULL 
            OR $4 = ANY("states")
          )
          AND (
            "schoolTypes" IS NULL 
            OR array_length("schoolTypes", 1) IS NULL 
            OR $5 = ANY("schoolTypes")
          )
      `
      
      // Execute raw SQL query using Prisma's raw query runner
      scholarships = await db.$queryRawUnsafe(
        sqlQuery,
        userPct,
        userInc,
        category,
        state,
        schoolType
      )
    } else {
      console.log("🔍 Querying in-memory mock database fallback...")
      // In-memory mock database fallback query
      const allScholarships = await db.scholarship.findMany()
      
      scholarships = allScholarships.filter((s: any) => {
        if (s.minPercentage !== null && userPct < s.minPercentage) return false
        if (s.maxIncome !== null && userInc > s.maxIncome) return false
        if (s.categories && s.categories.length > 0 && !s.categories.includes(category)) return false
        if (s.states && s.states.length > 0 && !s.states.includes(state)) return false
        if (s.schoolTypes && s.schoolTypes.length > 0 && !s.schoolTypes.includes(schoolType)) return false
        return true
      })
    }

    // 2. Score each matching scholarship by the number of criteria they meet
    const scoredMatches = scholarships.map((s: any) => {
      let criteriaCount = 0
      let metCount = 0

      // Criteria 1: Minimum Marks Percentage
      if (s.minPercentage !== null) {
        criteriaCount++
        if (userPct >= s.minPercentage) {
          metCount++
        }
      }

      // Criteria 2: Maximum Family Income
      if (s.maxIncome !== null) {
        criteriaCount++
        if (userInc <= s.maxIncome) {
          metCount++
        }
      }

      // Criteria 3: Social Category Match
      if (s.categories && s.categories.length > 0) {
        criteriaCount++
        if (s.categories.includes(category)) {
          metCount++
        }
      }

      // Criteria 4: State Domicile Match
      if (s.states && s.states.length > 0) {
        criteriaCount++
        if (s.states.includes(state)) {
          metCount++
        }
      }

      // Criteria 5: School Type Match
      if (s.schoolTypes && s.schoolTypes.length > 0) {
        criteriaCount++
        if (s.schoolTypes.includes(schoolType)) {
          metCount++
        }
      }

      // If a scholarship has no specific criteria (open to all), default base criteria count to 1
      const totalCriteria = criteriaCount || 1
      const matchedCriteria = metCount || 1

      // Calculate base match score from 0-100% based on matching criteria
      let matchPercent = Math.round((matchedCriteria / totalCriteria) * 85)

      // Add a bonus based on how much the student exceeds the academic requirements
      if (s.minPercentage !== null && userPct > s.minPercentage) {
        const excess = userPct - s.minPercentage
        matchPercent += Math.min(10, Math.round(excess * 0.8))
      }

      // Add a bonus if the student's family income is significantly lower than the maximum limit
      if (s.maxIncome !== null && userInc < s.maxIncome * 0.5) {
        matchPercent += 5
      }

      const finalScore = Math.min(98, Math.max(60, matchPercent))

      // Generate explanation reasons based on criteria met
      let reason = `Matches your marks (${userPct}%) and annual family income (₹${userInc.toLocaleString()}/yr).`
      if (s.schoolTypes && s.schoolTypes.includes(schoolType)) {
        reason = `Highly optimized for your ${schoolType} school background and percentage.`
      } else if (userPct >= 90) {
        reason = `Outstanding academic score (${userPct}%) gives you a high-probability merit match.`
      }

      // Format date for response
      const deadlineStr = s.deadline instanceof Date 
        ? s.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : new Date(s.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

      return {
        id: s.id,
        name: s.name,
        amount: s.amount,
        deadline: deadlineStr,
        tags: s.tags,
        match: finalScore,
        reason,
        matchedCriteria,
        totalCriteria
      }
    })

    // 3. Sort by match score descending
    scoredMatches.sort((a, b) => b.match - a.match)

    return NextResponse.json({ success: true, count: scoredMatches.length, matches: scoredMatches })
  } catch (error: any) {
    console.error("Scholarship match query error:", error)
    return NextResponse.json({ error: error.message || "Failed to process matches" }, { status: 500 })
  }
}
