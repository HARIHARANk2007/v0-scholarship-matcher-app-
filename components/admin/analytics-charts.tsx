"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts"
import { Loader2, AlertCircle } from "lucide-react"

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#9333ea", "#16a34a"]

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  itemStyle: { color: "#1e293b", fontSize: 13 },
  labelStyle: { color: "#64748b", fontWeight: 600, fontSize: 12 },
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function AnalyticsCharts() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-sm">Loading analytics…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />{error}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Scholarships by Amount Bucket */}
      <ChartCard title="Scholarship Count by Grant Size" subtitle="How many scholarships fall in each amount range">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.scholarshipsByAmount} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" fontSize={11} tick={{ fill: "#64748b" }} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tick={{ fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Scholarships" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 2. Top Tags */}
      <ChartCard title="Top Tags by Frequency" subtitle="Most common scholarship categories in the database">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topTags} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: "#64748b" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tag" fontSize={11} tick={{ fill: "#475569" }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Scholarships" radius={[0, 6, 6, 0]}>
                {data.topTags.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 3. Deadline Timeline */}
      <ChartCard title="Scholarship Deadlines Over Time" subtitle="Number of scholarships expiring per month">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.deadlineTimeline}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={11} tick={{ fill: "#64748b" }} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tick={{ fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" name="Scholarships" stroke="#7c3aed" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#7c3aed", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 4. Category Eligibility Donut */}
      <ChartCard title="Category Eligibility Breakdown" subtitle="Which student categories are covered by how many scholarships">
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.categoryBreakdown.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {data.categoryBreakdown.map((entry: any, i: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || COLORS[i % COLORS.length] }} />
                <span>{entry.name}</span>
                <span className="text-slate-400">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
