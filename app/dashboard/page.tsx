import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GraduationCap, TrendingUp, AlertCircle, ArrowRight, Clock } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"
import { DashboardDeadlines } from "@/components/dashboard-deadlines"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.warn("⚠️ NextAuth session retrieval failed on dashboard.", err)
  }

  // 1. Establish User Profile
  let userProfile = {
    name: "Guest User",
    class: "12",
    percentage: 80,
    income: 200000,
    category: "General",
    state: "Tamil Nadu",
    schoolType: "Govt Aided"
  }

  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id }
    })
    if (dbUser) {
      userProfile = {
        name: dbUser.name || "Student",
        class: dbUser.class || "12",
        percentage: dbUser.percentage || 0,
        income: dbUser.income || 0,
        category: dbUser.category || "General",
        state: dbUser.state || "",
        schoolType: dbUser.schoolType || "",
      }
    }
  }

  // 2. Fetch scholarships from database
  const dbScholarships = await db.scholarship.findMany()

  // 3. Filter eligible scholarships
  const eligibleScholarships = dbScholarships.filter((s: any) => {
    if (s.minPercentage !== null && userProfile.percentage < s.minPercentage) return false
    if (s.maxIncome !== null && userProfile.income > s.maxIncome) return false
    if (s.categories && s.categories.length > 0 && !s.categories.includes(userProfile.category)) return false
    if (s.states && s.states.length > 0 && userProfile.state && !s.states.includes(userProfile.state)) return false
    if (s.schoolTypes && s.schoolTypes.length > 0 && userProfile.schoolType && !s.schoolTypes.includes(userProfile.schoolType)) return false
    return true
  })

  // 4. Calculate Stats
  const matchScore = userProfile.percentage || 0
  const eligibleCount = eligibleScholarships.length
  const documentsCount = session?.user?.id 
    ? await db.document.count({ where: { userId: session.user.id } })
    : 0

  // 5. Get upcoming deadlines
  let appliedScholarshipIds: string[] = []
  if (session?.user?.id) {
    const apps = await db.application.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["SUBMITTED", "APPROVED"] }
      }
    })
    appliedScholarshipIds = apps.map((a: any) => a.scholarshipId)
  }

  const upcomingDeadlines = eligibleScholarships
    .filter((s: any) => !appliedScholarshipIds.includes(s.id))
    .map((s: any) => {
      const deadlineDate = new Date(s.deadline)
      const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        id: s.id,
        name: s.name,
        deadline: deadlineDate.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }),
        daysLeft: daysLeft > 0 ? daysLeft : 0
      }
    })
    .filter(item => item.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3)

  // 6. Get scored recent matches
  const recentMatches = eligibleScholarships.map((s: any) => {
    let criteriaCount = 0
    let metCount = 0

    if (s.minPercentage !== null) { criteriaCount++; if (userProfile.percentage >= s.minPercentage) metCount++ }
    if (s.maxIncome !== null) { criteriaCount++; if (userProfile.income <= s.maxIncome) metCount++ }
    if (s.categories && s.categories.length > 0) { criteriaCount++; if (s.categories.includes(userProfile.category)) metCount++ }
    if (s.states && s.states.length > 0) { criteriaCount++; if (userProfile.state && s.states.includes(userProfile.state)) metCount++ }
    if (s.schoolTypes && s.schoolTypes.length > 0) { criteriaCount++; if (userProfile.schoolType && s.schoolTypes.includes(userProfile.schoolType)) metCount++ }

    const totalCriteria = criteriaCount || 1
    const matchedCriteria = metCount || 1
    let matchPercent = Math.round((matchedCriteria / totalCriteria) * 85)

    if (s.minPercentage !== null && userProfile.percentage > s.minPercentage) {
      matchPercent += Math.min(10, Math.round((userProfile.percentage - s.minPercentage) * 0.8))
    }
    if (s.maxIncome !== null && userProfile.income < s.maxIncome * 0.5) matchPercent += 5

    const finalScore = Math.min(98, Math.max(60, matchPercent))
    return {
      id: s.id,
      name: s.name,
      amount: s.amount,
      match: finalScore,
      reason: s.description || "You meet the basic academic and social eligibility criteria.",
    }
  })
  .sort((a, b) => b.match - a.match)
  .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {userProfile.name}!</h1>
        <p className="text-sm text-slate-500">
          Here is a quick overview of your scholarship profile and matches.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Your Academic Percentage</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{matchScore}%</div>
            <p className="text-xs text-slate-500 mt-1">Extracted from your marksheet</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Eligible Scholarships</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{eligibleCount}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for application</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Verified Documents</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{documentsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Stored securely</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Upcoming Deadlines */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Upcoming Deadlines</h2>
            <Link href="/matches" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          <DashboardDeadlines initialDeadlines={upcomingDeadlines} isLoggedIn={!!session?.user} />
        </div>

        {/* Recent Scholarships */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Recent Matches</h2>
          <div className="space-y-4">
            {recentMatches.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-sm">
                No matching scholarships found yet.
              </div>
            ) : (
              recentMatches.map((scholarship) => (
                <Card
                  key={scholarship.id}
                  className="bg-white border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group"
                >
                  <Link href="/matches" className="block p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {scholarship.name}
                      </h3>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {scholarship.match}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{scholarship.reason}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">₹{scholarship.amount.toLocaleString("en-IN")}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </Card>
              ))
            )}

            <Link href="/matches" className="block">
              <Button
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 bg-transparent"
              >
                View All Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
