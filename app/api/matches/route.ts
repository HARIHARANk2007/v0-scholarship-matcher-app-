import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getAIExplanation, generateLocalExplanation } from "@/lib/ai-explainer"

// Max number of matches that will get a live Gemini-generated explanation.
// The rest fall back to the fast local sentence constructor.
const AI_EXPLAINER_LIMIT = 3

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

    // 2. Score each matching scholarship synchronously (no AI calls yet)
    const studentProfile = {
      name: body.name || "Guest User",
      percentage: userPct,
      income: userInc,
      category,
      state,
      schoolType,
    }

    const scored = scholarships.map((s: any) => {
      let criteriaCount = 0
      let metCount = 0

      if (s.minPercentage !== null) {
        criteriaCount++
        if (userPct >= s.minPercentage) metCount++
      }
      if (s.maxIncome !== null) {
        criteriaCount++
        if (userInc <= s.maxIncome) metCount++
      }
      if (s.categories && s.categories.length > 0) {
        criteriaCount++
        if (s.categories.includes(category)) metCount++
      }
      if (s.states && s.states.length > 0) {
        criteriaCount++
        if (s.states.includes(state)) metCount++
      }
      if (s.schoolTypes && s.schoolTypes.length > 0) {
        criteriaCount++
        if (s.schoolTypes.includes(schoolType)) metCount++
      }

      const totalCriteria = criteriaCount || 1
      const matchedCriteria = metCount || 1
      let matchPercent = Math.round((matchedCriteria / totalCriteria) * 85)

      if (s.minPercentage !== null && userPct > s.minPercentage) {
        const excess = userPct - s.minPercentage
        matchPercent += Math.min(10, Math.round(excess * 0.8))
      }
      if (s.maxIncome !== null && userInc < s.maxIncome * 0.5) {
        matchPercent += 5
      }

      const finalScore = Math.min(98, Math.max(60, matchPercent))

      const deadlineStr = s.deadline instanceof Date 
        ? s.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : new Date(s.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

      return { s, finalScore, matchedCriteria, totalCriteria, deadlineStr }
    })

    // 3. Sort by score descending so AI budget goes to the best matches
    scored.sort((a, b) => b.finalScore - a.finalScore)

    // 4. Attach explanations — Gemini for top N, local generator for the rest
    const scoredMatches = await Promise.all(
      scored.map(async ({ s, finalScore, matchedCriteria, totalCriteria, deadlineStr }, index) => {
        const scholarshipProfile = {
          name: s.name,
          minPercentage: s.minPercentage,
          maxIncome: s.maxIncome,
          categories: s.categories,
          states: s.states,
          schoolTypes: s.schoolTypes,
        }

        const reason = index < AI_EXPLAINER_LIMIT
          ? await getAIExplanation(studentProfile, scholarshipProfile)
          : generateLocalExplanation(studentProfile, scholarshipProfile)

        return {
          id: s.id,
          name: s.name,
          amount: s.amount,
          deadline: deadlineStr,
          tags: s.tags,
          match: finalScore,
          reason,
          matchedCriteria,
          totalCriteria,
        }
      })
    )

    return NextResponse.json({ success: true, count: scoredMatches.length, matches: scoredMatches })
  } catch (error: any) {
    console.error("Scholarship match query error:", error)
    return NextResponse.json({ error: error.message || "Failed to process matches" }, { status: 500 })
  }
}
