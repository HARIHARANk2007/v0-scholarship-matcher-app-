"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface DeadlineBadgeProps {
  deadline: string
}

export function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    const calc = () => {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      setDaysLeft(diff)
    }
    calc()
    const interval = setInterval(calc, 60 * 1000) // refresh every minute
    return () => clearInterval(interval)
  }, [deadline])

  if (daysLeft === null) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <Clock className="h-4 w-4" />
        <span>Deadline: {deadline}</span>
      </div>
    )
  }

  if (daysLeft < 0) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
        <Clock className="h-4 w-4" />
        <span className="line-through">{deadline}</span>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Expired</span>
      </div>
    )
  }

  const urgency =
    daysLeft <= 7
      ? { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: `${daysLeft}d left!` }
      : daysLeft <= 30
      ? { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: <Clock className="h-3.5 w-3.5" />, label: `${daysLeft} days left` }
      : { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", icon: <Clock className="h-3.5 w-3.5" />, label: `${daysLeft} days left` }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <Clock className="h-4 w-4 text-red-400" />
        <span>Deadline: <span className="text-slate-700 font-medium">{deadline}</span></span>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${urgency.bg} ${urgency.text} ${urgency.border}`}
      >
        {urgency.icon}
        {urgency.label}
      </span>
    </div>
  )
}
