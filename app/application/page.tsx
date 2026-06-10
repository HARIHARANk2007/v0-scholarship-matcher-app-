import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyData } from "@/lib/data"
import { Download, CheckCircle2, Edit2 } from "lucide-react"

export default function ApplicationPage() {
  const { user, ocrExtracted } = dummyData

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Application Preview</h1>
        <p className="text-muted-foreground">
          We've auto-filled this form using your uploaded documents. Please review before submitting.
        </p>
      </div>

      <Card className="bg-card border-border/50 mb-8">
        <CardHeader className="border-b border-border/50 bg-accent/20">
          <div className="flex justify-between items-center">
            <CardTitle>VidyaSamarth Scholarship Application</CardTitle>
            <span className="text-xs font-mono text-muted-foreground">ID: #APP-2025-882</span>
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
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">{user.name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Date of Birth</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">12 Aug 2006</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Category</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  {ocrExtracted.category}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Annual Family Income</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  ₹{user.income.toLocaleString("en-IN")}
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
                  {ocrExtracted.class}th Standard
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Overall Percentage</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  {ocrExtracted.percentage}%
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">School Name & Type</label>
                <div className="p-2 bg-accent/30 rounded border border-border/50 font-medium">
                  Govt Model Senior Secondary School ({ocrExtracted.schoolType})
                </div>
              </div>
            </div>
          </section>

          {/* Statement of Purpose */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Statement of Purpose
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
            <div className="p-4 bg-accent/30 rounded border border-border/50 text-sm leading-relaxed text-muted-foreground">
              I am writing to express my strong interest in the VidyaSamarth Scholarship. Coming from a{" "}
              {ocrExtracted.schoolType.toLowerCase()} background with an annual family income of ₹
              {user.income.toLocaleString("en-IN")}, pursuing higher education in Computer Science is a significant financial
              challenge. With my score of {ocrExtracted.percentage}% in Class 12, I have demonstrated my academic
              dedication. This scholarship will help reduce the financial burden on my family and allow me to focus on
              my studies.
            </div>
          </section>

          {/* Attachments */}
          <section>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Attached Documents
            </h3>
            <div className="flex gap-4">
              {user.documents.map((doc, i) => (
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

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" size="lg">
          Save as Draft
        </Button>
        <Button size="lg" className="gap-2">
          <Download className="h-4 w-4" /> Download PDF Application
        </Button>
      </div>
    </div>
  )
}
