"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"

const CATEGORIES = ["General", "OBC", "SC", "ST"]
const SCHOOL_TYPES = ["Govt", "Govt Aided", "Private"]

export interface ScholarshipFormData {
  id?: string
  name: string
  amount: string
  deadline: string
  description: string
  eligibility: string
  tags: string
  minPercentage: string
  maxIncome: string
  categories: string[]
  states: string
  schoolTypes: string[]
}

const EMPTY: ScholarshipFormData = {
  name: "", amount: "", deadline: "", description: "", eligibility: "",
  tags: "", minPercentage: "", maxIncome: "", categories: [], states: "", schoolTypes: [],
}

interface Props {
  open: boolean
  onClose: () => void
  initial?: ScholarshipFormData | null
  onSaved: () => void
}

export function ScholarshipForm({ open, onClose, initial, onSaved }: Props) {
  const [form, setForm] = useState<ScholarshipFormData>(initial || EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync when initial changes (switching between add/edit)
  useState(() => { setForm(initial || EMPTY) })

  const set = (key: keyof ScholarshipFormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleArr = (key: "categories" | "schoolTypes", val: string) => {
    const arr = form[key] as string[]
    setForm(prev => ({
      ...prev,
      [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = { ...form }
      const isEdit = !!form.id
      const res = await fetch("/api/admin/scholarships", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <SheetTitle className="text-lg font-bold">
            {form.id ? "Edit Scholarship" : "Add New Scholarship"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Scholarship Name *</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. NSP Central Sector Scheme" />
          </div>

          {/* Amount + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount (₹) *</Label>
              <Input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} required placeholder="20000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline *</Label>
              <Input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} required />
            </div>
          </div>

          {/* Min % + Max Income */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Min % (blank = none)</Label>
              <Input type="number" value={form.minPercentage} onChange={e => set("minPercentage", e.target.value)} placeholder="75" min="0" max="100" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Max Income (₹, blank = none)</Label>
              <Input type="number" value={form.maxIncome} onChange={e => set("maxIncome", e.target.value)} placeholder="250000" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</Label>
            <Textarea rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Short description of the scholarship" className="resize-none" />
          </div>

          {/* Eligibility */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eligibility Criteria</Label>
            <Textarea rows={2} value={form.eligibility} onChange={e => set("eligibility", e.target.value)} placeholder="Who is eligible?" className="resize-none" />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="e.g. Merit Based, Government, Girls" />
          </div>

          {/* States */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eligible States (comma-sep, blank = all)</Label>
            <Input value={form.states} onChange={e => set("states", e.target.value)} placeholder="e.g. Tamil Nadu, Karnataka" />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eligible Categories (blank = all)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat} type="button"
                  onClick={() => toggleArr("categories", cat)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${
                    form.categories.includes(cat)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* School Types */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eligible School Types (blank = all)</Label>
            <div className="flex flex-wrap gap-2">
              {SCHOOL_TYPES.map(type => (
                <button
                  key={type} type="button"
                  onClick={() => toggleArr("schoolTypes", type)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${
                    form.schoolTypes.includes(type)
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-violet-400"
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving…" : "Save Scholarship"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
