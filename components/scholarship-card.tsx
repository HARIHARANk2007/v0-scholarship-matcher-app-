"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, PenLine } from "lucide-react"
import { DeadlineBadge } from "@/components/deadline-badge"
import { RemindButton } from "@/components/remind-button"
import { ChecklistDrawer } from "@/components/checklist-drawer"

interface Scholarship {
  id: string
  name: string
  amount: number
  deadline: string
  tags: string[]
  match: number
  reason: string
}

interface StudentProfile {
  name: string
  percentage: number
  income: number
  category: string
  state: string
  schoolType: string
}

interface ScholarshipCardProps {
  scholarship: Scholarship
  profile: StudentProfile
}

export function ScholarshipCard({ scholarship, profile }: ScholarshipCardProps) {
  const essayUrl = `/essay?scholarship=${encodeURIComponent(scholarship.name)}`

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:border-blue-400/50 hover:shadow-md transition-all group overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Match Score */}
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
              {/* AI Explanation */}
              <p className="text-slate-500 mt-1 text-sm leading-relaxed">{scholarship.reason}</p>
            </div>
            <div className="text-left md:text-right shrink-0">
              <div className="text-2xl font-bold text-slate-800">₹{scholarship.amount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Grant Amount</div>
            </div>
          </div>

          {/* Footer row */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            {/* Deadline + Remind */}
            <div className="flex flex-wrap items-center gap-3">
              <DeadlineBadge deadline={scholarship.deadline} />
              <RemindButton
                scholarshipName={scholarship.name}
                deadline={scholarship.deadline}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <ChecklistDrawer
                scholarshipName={scholarship.name}
                tags={scholarship.tags}
                category={profile.category}
                state={profile.state}
                income={profile.income}
                schoolType={profile.schoolType}
              />
              <Link href={essayUrl} className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm">
                  <PenLine className="h-4 w-4" />
                  Write Essay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
