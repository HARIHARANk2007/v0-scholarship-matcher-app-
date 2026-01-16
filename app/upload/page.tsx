"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Check, Loader2, ArrowRight } from "lucide-react"
import { dummyData } from "@/lib/data"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = () => {
    setIsUploading(true)
    // Simulate upload progress
    let p = 0
    const interval = setInterval(() => {
      p += 10
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setIsAnalyzed(true)
      }
    }, 200)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Upload Your Marksheet</h1>
        <p className="text-muted-foreground">
          We'll use OCR to extract your grades and find the best scholarships for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors h-80 ${
              isAnalyzed
                ? "border-secondary/50 bg-secondary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            {isAnalyzed ? (
              <>
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-2">Analysis Complete</h3>
                <p className="text-sm text-muted-foreground">Marksheet.pdf processed successfully</p>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-medium mb-2">Analyzing Document...</h3>
                <div className="w-full max-w-[200px] h-2 bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag & drop or click to upload</h3>
                <p className="text-sm text-muted-foreground mb-6">Supports PDF, JPG, PNG (Max 5MB)</p>
                <Button onClick={handleUpload}>Select File</Button>
              </>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {isAnalyzed ? (
            <div className="animate-accordion-down">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Extracted Data</h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  High Confidence
                </span>
              </div>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">Student Name</span>
                    <span className="font-medium">{dummyData.ocrExtracted.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">Class</span>
                    <span className="font-medium">{dummyData.ocrExtracted.class}th Grade</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Subject Marks</span>
                    <div className="grid grid-cols-2 gap-2">
                      {dummyData.ocrExtracted.subjects.map((sub, i) => (
                        <div key={i} className="flex justify-between text-sm bg-accent/30 p-2 rounded">
                          <span>{sub.name}</span>
                          <span className="font-mono font-bold">{sub.marks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Total Percentage</span>
                    <span className="font-bold text-xl text-primary">{dummyData.ocrExtracted.percentage}%</span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Link href="/matches">
                  <Button className="w-full h-12 text-base" size="lg">
                    Generate Scholarship Matches <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground border border-border/30 rounded-2xl bg-accent/5">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Upload your marksheet to see the extracted data here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
