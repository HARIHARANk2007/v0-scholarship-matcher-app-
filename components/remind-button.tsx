"use client"

import { useState } from "react"
import { Bell, BellRing, Loader2, Check, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RemindButtonProps {
  scholarshipName: string
  deadline: string
}

export function RemindButton({ scholarshipName, deadline }: RemindButtonProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/remind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, scholarshipName, deadline }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
        <Check className="h-3.5 w-3.5" />
        Reminder sent to {email}
      </div>
    )
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs text-slate-500 hover:text-purple-600 hover:bg-purple-50 gap-1.5 border border-slate-200 hover:border-purple-200"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-3.5 w-3.5" />
        Remind Me
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap animate-in slide-in-from-left-2 duration-200">
      <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
        <Mail className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="h-6 text-xs border-none bg-transparent p-0 focus-visible:ring-0 w-40 placeholder:text-purple-300"
          autoFocus
        />
      </div>
      <Button
        size="sm"
        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BellRing className="h-3 w-3" />}
        {loading ? "Sending…" : "Set Reminder"}
      </Button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
      {error && <p className="text-xs text-red-500 w-full mt-1">{error}</p>}
    </div>
  )
}
