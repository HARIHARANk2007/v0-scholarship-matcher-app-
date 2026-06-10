"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  PenLine,
  RefreshCw,
  BookOpen,
} from "lucide-react"

const BULLET_LABELS = [
  {
    label: "Your biggest achievement",
    placeholder: "e.g. Scored 94% in Class 12 despite family financial hardship and supported younger sibling's schooling",
  },
  {
    label: "Your future goal / dream career",
    placeholder: "e.g. Become a software engineer and build EdTech tools for rural students in Tamil Nadu",
  },
  {
    label: "Why this scholarship matters to you",
    placeholder: "e.g. My father earns ₹15,000/month as a daily labourer — this scholarship would remove the pressure of tuition fees",
  },
]

export default function EssayPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [scholarshipName, setScholarshipName] = useState("")
  const [bullets, setBullets] = useState(["", "", ""])
  const [essay, setEssay] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const name = searchParams.get("scholarship")
    if (name) setScholarshipName(decodeURIComponent(name))

    // Try to get student profile from localStorage
    try {
      const stored = localStorage.getItem("userProfile")
      if (stored) setProfile(JSON.parse(stored))
    } catch {}
  }, [searchParams])

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0
  const filledBullets = bullets.filter(b => b.trim().length > 0).length

  const generate = async () => {
    if (filledBullets === 0) {
      setError("Add at least one bullet point about yourself before generating.")
      return
    }
    setLoading(true)
    setError(null)
    setEssay("")

    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bullets,
          scholarshipName: scholarshipName || "Scholarship Application",
          studentName: profile?.name || "Student",
          percentage: profile?.percentage,
          state: profile?.state,
          category: profile?.category,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setEssay(data.essay)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(essay)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateBullet = (i: number, val: string) => {
    const next = [...bullets]
    next[i] = val
    setBullets(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Back */}
        <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 mb-8 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-12 translate-y-12" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
              <Sparkles className="h-4 w-4" />
              AI-Powered Feature
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Essay Writer</h1>
            <p className="text-purple-100 leading-relaxed max-w-lg">
              Tell us 3 things about yourself and our AI will write a personalised,
              200-word scholarship essay in your voice — ready to copy and submit.
            </p>
          </div>
        </div>

        {/* Scholarship name */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Scholarship Name
            </label>
            <input
              type="text"
              value={scholarshipName}
              onChange={e => setScholarshipName(e.target.value)}
              placeholder="e.g. National Scholarship Portal — Pre Matric"
              className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
            />
          </CardContent>
        </Card>

        {/* Bullet Points */}
        <div className="space-y-4 mb-6">
          {BULLET_LABELS.map((item, i) => (
            <Card key={i} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {item.label}
                    </label>
                    <Textarea
                      value={bullets[i]}
                      onChange={e => updateBullet(i, e.target.value)}
                      placeholder={item.placeholder}
                      rows={2}
                      className="text-sm resize-none border-slate-200 focus:ring-purple-300 focus:border-purple-400 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate button */}
        <Button
          onClick={generate}
          disabled={loading || filledBullets === 0}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md gap-2 mb-6 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Writing your essay…
            </>
          ) : (
            <>
              <PenLine className="h-5 w-5" />
              Generate My Essay
            </>
          )}
        </Button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Essay Output */}
        {essay && (
          <Card className="border-purple-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-purple-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800 text-sm">Your Essay</span>
                <span className="text-xs bg-purple-100 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {wordCount} words
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generate}
                  className="h-8 text-xs text-purple-600 hover:bg-purple-100 gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={copy}
                  className={`h-8 text-xs gap-1.5 ${copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Essay"}
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-slate-700 leading-8 text-[15px] whitespace-pre-wrap">{essay}</p>
            </CardContent>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3">
              <p className="text-xs text-slate-400 text-center">
                ✨ Generated by Gemini AI · Review and personalise before submitting
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
