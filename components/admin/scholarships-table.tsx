"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus, Loader2, Search, AlertCircle, RefreshCw } from "lucide-react"
import { ScholarshipForm, type ScholarshipFormData } from "./scholarship-form"

interface Scholarship {
  id: string
  name: string
  amount: number
  deadline: string | Date
  tags: string[]
  minPercentage: number | null
  maxIncome: number | null
  categories: string[]
  states: string[]
  schoolTypes: string[]
  description: string
  eligibility: string
}

function toFormData(s: Scholarship): ScholarshipFormData {
  const d = new Date(s.deadline)
  const deadlineStr = isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]
  return {
    id: s.id,
    name: s.name,
    amount: String(s.amount),
    deadline: deadlineStr,
    description: s.description || "",
    eligibility: s.eligibility || "",
    tags: (s.tags || []).join(", "),
    minPercentage: s.minPercentage != null ? String(s.minPercentage) : "",
    maxIncome: s.maxIncome != null ? String(s.maxIncome) : "",
    categories: s.categories || [],
    states: (s.states || []).join(", "),
    schoolTypes: s.schoolTypes || [],
  }
}

export function ScholarshipsTable() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filtered, setFiltered] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ScholarshipFormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/scholarships")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScholarships(data.scholarships)
      setFiltered(data.scholarships)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q
      ? scholarships.filter(s => s.name.toLowerCase().includes(q) || (s.tags || []).some(t => t.toLowerCase().includes(q)))
      : scholarships
    )
  }, [search, scholarships])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/scholarships?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await fetchAll()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const openAdd = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (s: Scholarship) => { setEditTarget(toFormData(s)); setFormOpen(true) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tag…"
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="h-9 gap-1.5 text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={openAdd} className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Add Scholarship
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-16 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[35%]">Name</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => {
                  const deadline = new Date(s.deadline)
                  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 leading-tight">{s.name}</div>
                        {s.minPercentage && <div className="text-[11px] text-slate-400 mt-0.5">Min {s.minPercentage}%{s.maxIncome ? ` · ₹${(s.maxIncome / 100000).toFixed(1)}L income` : ""}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-800">₹{s.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(s.tags || []).slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-none py-0 px-1.5">{tag}</Badge>
                          ))}
                          {(s.tags || []).length > 2 && <span className="text-[10px] text-slate-400">+{s.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-medium ${daysLeft < 0 ? "text-slate-400" : daysLeft <= 30 ? "text-amber-600" : "text-slate-600"}`}>
                          {isNaN(deadline.getTime()) ? "—" : deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          {!isNaN(deadline.getTime()) && daysLeft >= 0 && <span className="text-slate-400 font-normal"> · {daysLeft}d</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(s.id, s.name)}
                            disabled={deleting === s.id}
                          >
                            {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No scholarships found</div>
            )}
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            Showing {filtered.length} of {scholarships.length} scholarships
          </div>
        </div>
      )}

      <ScholarshipForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        initial={editTarget}
        onSaved={fetchAll}
      />
    </div>
  )
}
