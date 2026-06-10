"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, CheckCircle2, Circle, AlertCircle, Sparkles } from "lucide-react"

interface ChecklistItem {
  document: string
  description: string
  required: boolean
}

interface ChecklistDrawerProps {
  scholarshipName: string
  tags: string[]
  category: string
  state: string
  income: number
  schoolType: string
}

export function ChecklistDrawer({ scholarshipName, tags, category, state, income, schoolType }: ChecklistDrawerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const load = async () => {
    if (checklist) return // already loaded
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scholarshipName, tags, category, state, income, schoolType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load checklist")
      setChecklist(data.checklist)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (val) load()
  }

  const toggle = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  const doneCount = checklist ? checklist.filter((_, i) => checked[i]).length : 0
  const totalRequired = checklist ? checklist.filter(c => c.required).length : 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
        >
          <FileText className="h-4 w-4" />
          View Documents
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI Document Checklist
          </div>
          <SheetTitle className="text-lg font-bold text-slate-800 leading-snug">
            {scholarshipName}
          </SheetTitle>
          {checklist && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${checklist.length ? (doneCount / checklist.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 shrink-0">{doneCount}/{checklist.length} ready</span>
            </div>
          )}
        </SheetHeader>

        <div className="py-4 space-y-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm">AI is personalising your checklist…</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {checklist && (
            <>
              <p className="text-xs text-slate-400 mb-3 px-1">
                {totalRequired} required documents · tap to mark ready
              </p>
              {checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    checked[i]
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {checked[i] ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-sm ${checked[i] ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                        {item.document}
                      </span>
                      {!item.required && (
                        <span className="text-[10px] bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </button>
              ))}

              <div className="pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs text-slate-400 text-center">
                  Generated by Gemini AI · Verify requirements on the official scholarship portal
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
