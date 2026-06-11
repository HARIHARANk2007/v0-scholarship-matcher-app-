"use client"

import { useEffect, useState } from "react"
import { Check, X, Loader2, AlertCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ApplicationRow {
  id: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  scholarship: {
    name: string
    amount: number
  }
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchApplications = () => {
    setLoading(true)
    fetch("/api/admin/applications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load applications")
        return res.json()
      })
      .then((data) => {
        setApplications(data.applications || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleUpdateStatus = async (id: string, status: string, name: string) => {
    setActionId(id)
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update status")
      }

      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status } : app))
      )

      toast({
        title: `Application ${status.toLowerCase()}`,
        description: `Successfully ${status.toLowerCase()} application for ${name}.`
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setActionId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">Approved</span>
      case "REJECTED":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">Rejected</span>
      case "SUBMITTED":
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">Submitted</span>
      case "PENDING":
      default:
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">Draft</span>
    }
  }

  const filteredApps = filterStatus === "ALL" 
    ? applications 
    : applications.filter(app => app.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-3 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-sm">Loading applications…</span>
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table header and filter toolbar */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-wrap gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications: {filteredApps.length}</span>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-8 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Drafts</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Scholarship</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Applied Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 bg-white">
                  No student applications match this filter.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-800">{app.user?.name || "Student"}</div>
                      <div className="text-xs text-slate-400">{app.user?.email || "No email"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700 line-clamp-1">{app.scholarship?.name || "Unknown Scholarship"}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                    ₹{app.scholarship?.amount?.toLocaleString("en-IN") || "0"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                    {new Date(app.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {app.status === "SUBMITTED" && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={actionId === app.id}
                            onClick={() => handleUpdateStatus(app.id, "APPROVED", app.user?.name || "Student")}
                            className="h-8 w-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50 bg-emerald-50/30"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={actionId === app.id}
                            onClick={() => handleUpdateStatus(app.id, "REJECTED", app.user?.name || "Student")}
                            className="h-8 w-8 text-red-600 border-red-100 hover:bg-red-50 bg-red-50/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {app.status !== "SUBMITTED" && (
                        <span className="text-xs text-slate-400 italic">No pending actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
