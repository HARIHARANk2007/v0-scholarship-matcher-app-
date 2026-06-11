"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, CheckCircle2, Edit2, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name: string
  class: string
  percentage: number
  income: number
  category: string
  state: string
  schoolType: string
}

interface ApplicationPreviewClientProps {
  userProfile: UserProfile
  initialDocuments: string[]
  isLoggedIn: boolean
}

export function ApplicationPreviewClient({
  userProfile,
  initialDocuments,
  isLoggedIn,
}: ApplicationPreviewClientProps) {
  const { toast } = useToast()
  
  // Local state for SOP editing
  const [isEditingSop, setIsEditingSop] = useState(false)
  const [sopText, setSopText] = useState(
    `I am writing to express my strong interest in the VidyaSamarth Scholarship. Coming from a ${(
      userProfile.schoolType || "Govt"
    ).toLowerCase()} background with an annual family income of ₹${userProfile.income.toLocaleString(
      "en-IN"
    )}, pursuing higher education is a significant financial challenge. With my score of ${
      userProfile.percentage
    }% in Class ${userProfile.class}, I have demonstrated my academic dedication. This scholarship will help reduce the financial burden on my family and allow me to focus on my studies.`
  )

  const handleSaveDraft = () => {
    // Save draft to localStorage as mock persistence
    const draft = {
      userProfile,
      sop: sopText,
      documents: initialDocuments,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem("application_draft", JSON.stringify(draft))
    
    toast({
      title: "Draft Saved!",
      description: "Your application draft has been saved successfully.",
    })
  }

  const handleDownloadPdf = () => {
    // Using window.print() combined with print-only CSS media query styles
    // generates a perfect high-fidelity PDF output.
    toast({
      title: "Generating PDF...",
      description: "Preparing your application layout for print/PDF download.",
    })
    
    setTimeout(() => {
      window.print()
    }, 500)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Print-only CSS styling rules */}
      <style jsx global>{`
        @media print {
          /* Hide sidebar, topbar, wrapper containers, alert banners, and action buttons */
          nav, aside, header, button, .flex-col.sm\\:flex-row, .mb-6, .mb-8, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main, .container, div {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .border-border\\/50 {
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>

      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold mb-2">Application Preview</h1>
        <p className="text-muted-foreground">
          We've auto-filled this form using your uploaded documents. Please review before submitting.
        </p>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex gap-3 no-print">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 animate-pulse mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5 text-amber-900 text-sm">Guest Preview Mode</span>
            You are currently viewing this page in guest mode. The application below is populated with sample details. <strong>Please log in or register to upload your actual documents, save application drafts, and submit to live scholarship programs!</strong>
            <div className="mt-3 flex gap-2">
              <Link href="/login">
                <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 bg-white/50 text-amber-800 hover:bg-amber-100 font-medium px-3">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-card border-border/50 mb-8 print-card">
        <CardHeader className="border-b border-border/50 bg-accent/20">
          <div className="flex justify-between items-center">
            <CardTitle>VidyaSamarth Scholarship Application</CardTitle>
            <span className="text-xs font-mono text-muted-foreground">ID: #APP-2026-882</span>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Personal Details */}
          <section>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Personal Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Full Name</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">{userProfile.name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Date of Birth</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">12 Aug 2006</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Category</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  {userProfile.category}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Annual Family Income</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  ₹{userProfile.income.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </section>

          {/* Academic Details */}
          <section>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Academic Performance
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Class/Grade</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  {userProfile.class}th Standard
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Overall Percentage</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  {userProfile.percentage}%
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">School Name & Type</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  Govt Model Senior Secondary School ({userProfile.schoolType || "Govt"})
                </div>
              </div>
            </div>
          </section>

          {/* Statement of Purpose */}
          <section>
            <div className="flex justify-between items-center mb-2 no-print">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Statement of Purpose
              </h3>
              {isEditingSop ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingSop(false)}
                  className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                >
                  <Save className="h-3 w-3" /> Done
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingSop(true)}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
              )}
            </div>
            {/* Show only Statement of Purpose title in print */}
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 hidden print:flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Statement of Purpose
            </h3>
            
            {isEditingSop ? (
              <div className="space-y-2 no-print">
                <Textarea
                  value={sopText}
                  onChange={(e) => setSopText(e.target.value)}
                  className="min-h-[140px] text-sm bg-white"
                />
              </div>
            ) : (
              <div className="p-4 bg-accent/30 rounded border border-border/50 text-sm leading-relaxed text-muted-foreground">
                {sopText}
              </div>
            )}
          </section>

          {/* Attachments */}
          <section>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Attached Documents
            </h3>
            <div className="flex flex-wrap gap-4">
              {initialDocuments.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 px-3 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20"
                >
                  <CheckCircle2 className="h-4 w-4" /> {doc}
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-end no-print">
        <Button variant="outline" size="lg" onClick={handleSaveDraft} className="w-full sm:w-auto">
          Save as Draft
        </Button>
        <Button size="lg" onClick={handleDownloadPdf} className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4" /> Download PDF Application
        </Button>
      </div>
    </div>
  )
}
