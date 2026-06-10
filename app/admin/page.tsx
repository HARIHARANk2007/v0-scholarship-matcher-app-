import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScholarshipsTable } from "@/components/admin/scholarships-table"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import {
  Users, IndianRupee, BookOpen, TrendingUp, Clock, Star, Loader2,
} from "lucide-react"
import db from "@/lib/db"

// ─── Live Stats computed server-side ─────────────────────────────────────────
async function getStats() {
  const [scholarships, users] = await Promise.all([
    db.scholarship.findMany(),
    db.user.findMany(),
  ])

  const totalAmount = scholarships.reduce((s: number, sc: any) => s + (sc.amount || 0), 0)
  const avgAmount = scholarships.length > 0 ? Math.round(totalAmount / scholarships.length) : 0
  const highValue = scholarships.filter((s: any) => s.amount >= 50000).length

  const now = Date.now()
  const expiringSoon = scholarships.filter((s: any) => {
    const d = new Date(s.deadline).getTime()
    const days = Math.ceil((d - now) / 86400000)
    return days >= 0 && days <= 30
  }).length

  // Tag frequency
  const tagFreq: Record<string, number> = {}
  for (const s of scholarships) {
    for (const t of (s.tags || [])) tagFreq[t] = (tagFreq[t] || 0) + 1
  }
  const topTag = Object.entries(tagFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  return {
    totalScholarships: scholarships.length,
    totalStudents: users.length,
    totalAmount,
    avgAmount,
    highValue,
    expiringSoon,
    topTag,
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, sub, icon: Icon, accent,
}: {
  title: string; value: string | number; sub: string
  icon: React.ComponentType<any>; accent: string
}) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const stats = await getStats()

  const formatAmount = (n: number) =>
    n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000  ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${n.toLocaleString()}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <div className="container mx-auto px-4 py-10 max-w-7xl space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Data · Powered by DB
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">All numbers computed in real-time from the scholarship database.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Last refreshed</div>
            <div className="text-sm font-medium text-slate-600">
              {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Scholarships"
            value={stats.totalScholarships}
            sub="Active in database"
            icon={BookOpen}
            accent="bg-blue-600"
          />
          <StatCard
            title="Total Grant Pool"
            value={formatAmount(stats.totalAmount)}
            sub={`Avg ${formatAmount(stats.avgAmount)} per scholarship`}
            icon={IndianRupee}
            accent="bg-emerald-600"
          />
          <StatCard
            title="Registered Students"
            value={stats.totalStudents}
            sub="Signed up on EduBridge"
            icon={Users}
            accent="bg-violet-600"
          />
          <StatCard
            title="Expiring This Month"
            value={stats.expiringSoon}
            sub={`${stats.highValue} scholarships above ₹50K`}
            icon={Clock}
            accent="bg-amber-500"
          />
        </div>

        {/* Secondary stat strip */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Most Common Tag</div>
              <div className="text-base font-bold text-slate-800">{stats.topTag}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Closing Soon (≤ 30 days)</div>
              <div className="text-base font-bold text-slate-800">{stats.expiringSoon} scholarships</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">High-Value Grants (≥ ₹50K)</div>
              <div className="text-base font-bold text-slate-800">{stats.highValue} scholarships</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
            <p className="text-sm text-slate-400 mt-0.5">Visual breakdown of scholarship data — all computed from live DB queries</p>
          </div>
          <Suspense fallback={
            <div className="flex items-center gap-3 py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading charts…</span>
            </div>
          }>
            <AnalyticsCharts />
          </Suspense>
        </section>

        {/* Scholarship CRUD Table */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">Manage Scholarships</h2>
            <p className="text-sm text-slate-400 mt-0.5">Add, edit, or remove scholarships. Changes are reflected immediately in student matches.</p>
          </div>
          <Suspense fallback={
            <div className="flex items-center gap-3 py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading table…</span>
            </div>
          }>
            <ScholarshipsTable />
          </Suspense>
        </section>

      </div>
    </div>
  )
}
