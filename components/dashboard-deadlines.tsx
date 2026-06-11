"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Clock, Check, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface DeadlineItem {
  id: string
  name: string
  deadline: string
  daysLeft: number
}

interface DashboardDeadlinesProps {
  initialDeadlines: DeadlineItem[]
  isLoggedIn: boolean
}

export function DashboardDeadlines({ initialDeadlines, isLoggedIn }: DashboardDeadlinesProps) {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(initialDeadlines)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMarkApplied = async (id: string, name: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to record applications in your dashboard.",
        variant: "destructive"
      })
      return
    }

    setLoadingId(id)
    try {
      const res = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipName: name,
          status: "SUBMITTED"
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to mark as applied")
      }

      // Remove from list locally with success toast
      setDeadlines(prev => prev.filter(item => item.id !== id))
      
      toast({
        title: "Application Recorded!",
        description: `Successfully marked ${name} as applied.`,
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Action Failed",
        description: err.message || "Failed to submit application details to the database.",
        variant: "destructive"
      })
    } finally {
      setLoadingId(null)
    }
  }

  if (deadlines.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-sm">
        No upcoming deadlines for matching scholarships.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deadlines.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all group flex-wrap sm:flex-nowrap gap-4"
        >
          <div className="flex items-start gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              item.daysLeft <= 7 ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
            }`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-sm text-slate-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1 text-slate-400" /> Deadline: {item.deadline}
              </p>
            </div>
          </div>
          
          <div className="text-right flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              item.daysLeft <= 7 
                ? "bg-red-50 text-red-600 border-red-200" 
                : item.daysLeft <= 30
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              {item.daysLeft} days left
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === item.id}
                onClick={() => handleMarkApplied(item.id, item.name)}
                className="h-8 text-xs border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-700 gap-1"
              >
                {loadingId === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Mark Applied
              </Button>
              <Link href="/matches">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  Apply <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
