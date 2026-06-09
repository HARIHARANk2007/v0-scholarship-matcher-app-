import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, Filter, AlertCircle, RefreshCw } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"
import { getAIExplanation, generateLocalExplanation } from "@/lib/ai-explainer"

// Max number of matches that will get a live Gemini-generated explanation.
const AI_EXPLAINER_LIMIT = 3


interface MatchesPageProps {
  searchParams: Promise<{
    fromUpload?: string
    name?: string
    class?: string
    percentage?: string
    income?: string
    category?: string
    state?: string
    schoolType?: string
  }>
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams
  
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.warn("⚠️ NextAuth session decryption failed (usually due to missing/mismatched NEXTAUTH_SECRET). Falling back to guest mode.", err)
  }

  // 1. Establish User Profile (from search params OR database OR fallback defaults)
  let userProfile = {
    name: "Arjun Kumar",
    percentage: 87.0,
    class: "12",
    income: 150000,
    category: "OBC",
    state: "Tamil Nadu",
    schoolType: "Govt Aided"
  }

  // Check if we have parameters from direct upload redirect
  const hasParams = !!(params.percentage || params.income)

  if (hasParams) {
    userProfile = {
      name: params.name || "Guest User",
      percentage: params.percentage ? parseFloat(params.percentage) : 80,
      class: params.class || "12",
      income: params.income ? parseInt(params.income) : 200000,
      category: params.category || "General",
      state: params.state || "Tamil Nadu",
      schoolType: params.schoolType || "Govt Aided"
    }
  } else if (session?.user?.id) {
    // Check if the authenticated user has updated their profile
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id }
    })
    if (dbUser) {
      userProfile = {
        name: dbUser.name || "User",
        percentage: dbUser.percentage || 87.0,
        class: dbUser.class || "12",
        income: dbUser.income || 150000,
        category: dbUser.category || "OBC",
        state: dbUser.state || "Tamil Nadu",
        schoolType: dbUser.schoolType || "Govt Aided"
      }
    }
  }

  // 2. Fetch scholarships from database
  const dbScholarships = await db.scholarship.findMany()

  // 3. Filter eligible scholarships first (synchronous — no API calls)
  const eligibleScholarships = dbScholarships.filter((s: any) => {
    if (s.minPercentage !== null && userProfile.percentage < s.minPercentage) return false
    if (s.maxIncome !== null && userProfile.income > s.maxIncome) return false
    if (s.categories && s.categories.length > 0 && !s.categories.includes(userProfile.category)) return false
    if (s.states && s.states.length > 0 && !s.states.includes(userProfile.state)) return false
    if (s.schoolTypes && s.schoolTypes.length > 0 && !s.schoolTypes.includes(userProfile.schoolType)) return false
    return true
  })

  // 4. Score each eligible scholarship synchronously (no AI calls yet)
  const studentProfile = {
    name: userProfile.name,
    percentage: userProfile.percentage,
    income: userProfile.income,
    category: userProfile.category,
    state: userProfile.state,
    schoolType: userProfile.schoolType,
  }

  const scoredRaw = eligibleScholarships.map((s: any) => {
    let criteriaCount = 0
    let metCount = 0

    if (s.minPercentage !== null) { criteriaCount++; if (userProfile.percentage >= s.minPercentage) metCount++ }
    if (s.maxIncome !== null) { criteriaCount++; if (userProfile.income <= s.maxIncome) metCount++ }
    if (s.categories && s.categories.length > 0) { criteriaCount++; if (s.categories.includes(userProfile.category)) metCount++ }
    if (s.states && s.states.length > 0) { criteriaCount++; if (s.states.includes(userProfile.state)) metCount++ }
    if (s.schoolTypes && s.schoolTypes.length > 0) { criteriaCount++; if (s.schoolTypes.includes(userProfile.schoolType)) metCount++ }

    const totalCriteria = criteriaCount || 1
    const matchedCriteria = metCount || 1
    let matchPercent = Math.round((matchedCriteria / totalCriteria) * 85)

    if (s.minPercentage !== null && userProfile.percentage > s.minPercentage) {
      matchPercent += Math.min(10, Math.round((userProfile.percentage - s.minPercentage) * 0.8))
    }
    if (s.maxIncome !== null && userProfile.income < s.maxIncome * 0.5) matchPercent += 5

    const finalScore = Math.min(98, Math.max(60, matchPercent))
    const deadlineStr = s.deadline instanceof Date
      ? s.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : new Date(s.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

    return { s, finalScore, deadlineStr }
  })

  // 5. Sort by score descending so AI budget goes to the highest matches first
  scoredRaw.sort((a, b) => b.finalScore - a.finalScore)

  // 6. Attach explanations — Gemini for top AI_EXPLAINER_LIMIT, local for the rest
  const matchedScholarships = await Promise.all(
    scoredRaw.map(async ({ s, finalScore, deadlineStr }, index) => {
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
      }
    })
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Scholarship Matches</h1>
          <p className="text-muted-foreground mt-1">
            Showing opportunities matching your confirmed profile: <span className="font-semibold text-slate-800">{userProfile.percentage}% Marks</span>, <span className="font-semibold text-slate-800">Income ₹{userProfile.income.toLocaleString()}/yr</span>, <span className="font-semibold text-slate-800">{userProfile.category}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button variant="outline" className="gap-2 bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Re-upload Marksheet
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Filter Results
          </Button>
        </div>
      </div>

      {matchedScholarships.length === 0 ? (
        <Card className="p-12 text-center border border-border/30 bg-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Matching Scholarships</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            We couldn't find any scholarships matching your criteria. Try uploading a different marksheet or editing your profile limits.
          </p>
          <Link href="/upload">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Update Profile Details</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {matchedScholarships.map((scholarship) => (
            <Card
              key={scholarship.id}
              className="bg-white border border-slate-200 shadow-sm hover:border-blue-400/50 hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Match Score Indicator */}
                <div className="w-full md:w-32 bg-slate-50/50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
                  <div
                    className={`text-3xl font-extrabold font-mono ${
                      scholarship.match >= 90
                        ? "text-emerald-600"
                        : scholarship.match >= 80
                          ? "text-blue-600"
                          : "text-amber-600"
                    }`}
                  >
                    {scholarship.match}%
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Match</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {scholarship.tags.map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none text-[10px] py-0.5 px-2 rounded-full font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {scholarship.name}
                      </h3>
                      <p className="text-slate-500 mt-1 text-sm">{scholarship.reason}</p>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <div className="text-2xl font-bold text-slate-800">₹{scholarship.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Grant Amount</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500 w-full sm:w-auto">
                      <Clock className="h-4 w-4 mr-1.5 text-red-500" />
                      Deadline: <span className="text-slate-700 font-medium ml-1">{scholarship.deadline}</span>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Link href="/application" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50">
                          View Details
                        </Button>
                      </Link>
                      <Link href="/application" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                          Auto-Fill Application <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
