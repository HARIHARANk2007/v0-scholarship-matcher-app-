"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Check, Loader2, ArrowRight, Plus, Trash2, AlertTriangle } from "lucide-react"
import { parseMarksheetText, ParsedMarksheet } from "@/lib/ocr-parser"
import { createWorker } from "tesseract.js"

// Load PDFJS from CDN dynamically to avoid bundler/worker issues in Next.js
const loadPdfJs = () => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
    script.onload = () => {
      ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function UploadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload & processing states
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Extracted/Confirmed Form States
  const [name, setName] = useState("")
  const [className, setClassName] = useState("12")
  const [percentage, setPercentage] = useState<number>(80)
  const [subjects, setSubjects] = useState<{ name: string; marks: number }[]>([])
  const [isFallbackUsed, setIsFallbackUsed] = useState(false)
  
  // Extra eligibility criteria for confirmation
  const [income, setIncome] = useState<number>(200000)
  const [category, setCategory] = useState("General")
  const [state, setState] = useState("Tamil Nadu")
  const [schoolType, setSchoolType] = useState("Govt Aided")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      processFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Parse and run OCR on uploaded document
  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setIsProcessing(true)
    setIsAnalyzed(false)
    setIsFallbackUsed(false)
    setErrorMsg(null)
    setProgress(10)
    setStatusMessage("Scanning document...")

    try {
      let rawText = ""

      if (selectedFile.type === "application/pdf") {
        setProgress(30)
        setStatusMessage("Loading PDF renderer...")
        await loadPdfJs()

        const fileReader = new FileReader()
        
        const pdfTextPromise = new Promise<string>((resolve, reject) => {
          fileReader.onload = async function () {
            try {
              const typedarray = new Uint8Array(this.result as ArrayBuffer)
              const pdfjsLib = (window as any).pdfjsLib
              const pdf = await pdfjsLib.getDocument(typedarray).promise
              
              setProgress(50)
              setStatusMessage("Extracting text from PDF...")
              
              // Load the first page
              const page = await pdf.getPage(1)
              
              // 1. Try to extract direct selectable text
              const textContent = await page.getTextContent()
              const textItems = textContent.items.map((item: any) => item.str)
              const extractedText = textItems.join(" ")

              // If the PDF has text, we can use it immediately!
              if (extractedText.trim().length > 100) {
                resolve(extractedText)
                return
              }

              // 2. Otherwise, fall back to rendering page 1 to canvas for OCR
              setProgress(60)
              setStatusMessage("Scanned PDF detected. Rendering page to image...")
              
              const viewport = page.getViewport({ scale: 2.0 })
              const canvas = document.createElement("canvas")
              const context = canvas.getContext("2d")
              canvas.height = viewport.height
              canvas.width = viewport.width

              if (!context) {
                throw new Error("Could not create canvas context")
              }

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise

              setProgress(70)
              setStatusMessage("Running OCR engine (Tesseract.js)...")
              
              const worker = await createWorker("eng")
              const { data: { text } } = await worker.recognize(canvas)
              await worker.terminate()
              
              resolve(text)
            } catch (err) {
              reject(err)
            }
          }
          fileReader.onerror = () => reject(new Error("File reading failed"))
          fileReader.readAsArrayBuffer(selectedFile)
        })

        rawText = await pdfTextPromise
      } else if (selectedFile.type.startsWith("image/")) {
        setProgress(50)
        setStatusMessage("Initializing OCR engine (Tesseract.js)...")
        
        const worker = await createWorker("eng")
        
        setProgress(70)
        setStatusMessage("Scanning image for text...")
        
        const { data: { text } } = await worker.recognize(selectedFile)
        await worker.terminate()
        
        rawText = text
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or Image.")
      }

      console.log("--- RAW EXTRACTED OCR TEXT ---")
      console.log(rawText || "(No text extracted)")
      console.log("------------------------------")

      setProgress(90)
      setStatusMessage("Analyzing grades & percentages...")
      
      const parsedData = parseMarksheetText(rawText)
      
      // Populate states with parsed data
      setName(parsedData.name)
      setClassName(parsedData.class)
      setPercentage(parsedData.percentage)
      setSubjects(parsedData.subjects)
      setIsFallbackUsed(!!parsedData.isFallbackUsed)
      
      setProgress(100)
      setIsProcessing(false)
      setIsAnalyzed(true)
    } catch (err: any) {
      console.error(err)
      setIsProcessing(false)
      setErrorMsg(err.message || "Failed to process marksheet. You can manually enter your details.")
      
      // Fallback default structure so they can manually input
      setName("Arjun Kumar")
      setClassName("12")
      setPercentage(80)
      setSubjects([
        { name: "Mathematics", marks: 80 },
        { name: "Physics", marks: 80 },
        { name: "Chemistry", marks: 80 },
        { name: "English", marks: 80 }
      ])
      setIsFallbackUsed(true)
      setIsAnalyzed(true)
    }
  }

  // Handle subject changes
  const handleSubjectChange = (index: number, field: "name" | "marks", value: string) => {
    const updated = [...subjects]
    if (field === "marks") {
      const score = Math.min(100, Math.max(0, parseInt(value) || 0))
      updated[index].marks = score
    } else {
      updated[index].name = value
    }
    setSubjects(updated)
    recalculatePercentage(updated)
  }

  const addSubject = () => {
    const updated = [...subjects, { name: "New Subject", marks: 80 }]
    setSubjects(updated)
    recalculatePercentage(updated)
  }

  const deleteSubject = (index: number) => {
    const updated = subjects.filter((_, i) => i !== index)
    setSubjects(updated)
    recalculatePercentage(updated)
  }

  const recalculatePercentage = (subs: { name: string; marks: number }[]) => {
    if (subs.length === 0) {
      setPercentage(0)
      return
    }
    const total = subs.reduce((sum, s) => sum + s.marks, 0)
    const avg = Math.round((total / (subs.length * 100)) * 1000) / 10
    setPercentage(avg)
  }

  // Submit confirmed details
  const handleConfirm = async () => {
    const confirmedProfile = {
      name,
      class: className,
      percentage,
      subjects,
      income,
      category,
      state,
      schoolType,
      fileName: file?.name || "Marksheet.pdf",
    }

    // 1. Save to local storage for guest/immediate matches filtering
    localStorage.setItem("userProfile", JSON.stringify(confirmedProfile))

    // 2. Try to save to DB via API if logged in
    if (session?.user) {
      try {
        await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(confirmedProfile),
        })
      } catch (err) {
        console.error("Failed to sync profile with database", err)
      }
    }

    // 3. Redirect to matches page with parameters for live calculations
    const params = new URLSearchParams({
      fromUpload: "true",
      name,
      class: className,
      percentage: percentage.toString(),
      income: income.toString(),
      category,
      state,
      schoolType,
    })
    router.push(`/matches?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Upload Your Marksheet</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We use local WebAssembly-based OCR to read your grades securely right in your browser.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Upload Container */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border/40 bg-white/50 backdrop-blur-sm shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[250px] ${
                  isAnalyzed
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-slate-300 hover:border-blue-500/50 hover:bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {isAnalyzed ? (
                  <>
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                      <Check className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 mb-1">Marksheet Processed</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {file?.name || "marksheet.pdf"}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 bg-transparent border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                      Upload Another
                    </Button>
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                    <h3 className="text-base font-semibold mb-2">{statusMessage}</h3>
                    <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold mb-1 text-slate-800">Drag & drop or click to upload</h3>
                    <p className="text-xs text-muted-foreground mb-4">Supports PDF, JPG, PNG (Max 5MB)</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Select File</Button>
                  </>
                )}
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-semibold">OCR Notice:</span> {errorMsg}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-700">🔒 Safe and Secure</h4>
            <p>Your documents are processed locally on your machine and are never uploaded to any remote server for OCR.</p>
          </div>
        </div>

        {/* Extracted Data Confirmation Form */}
        <div className="lg:col-span-7">
          {isAnalyzed ? (
            <Card className="border border-border/40 bg-white shadow-lg rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Confirm Marksheet Details</h2>
                {isFallbackUsed ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Manual Review Required
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Check className="h-3.5 w-3.5" /> Extracted Successfully
                  </div>
                )}
              </div>

              <CardContent className="p-6 space-y-6">
                {isFallbackUsed && (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 animate-pulse" />
                    <div>
                      <span className="font-semibold block mb-0.5 text-amber-900">⚠️ Scanned Data Notice</span>
                      We couldn't automatically read your name or grades from this marksheet image/PDF. We have pre-filled this form with example values — <strong>please review and edit the fields below to match your actual marksheet grades!</strong>
                    </div>
                  </div>
                )}
                {/* Basic Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                      id="student-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Candidate's Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="student-class">Marksheet Class</Label>
                    <Select value={className} onValueChange={setClassName}>
                      <SelectTrigger id="student-class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Class 10th (Secondary)</SelectItem>
                        <SelectItem value="12">Class 12th (Senior Secondary)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Profile Info for better matching */}
                <div className="grid md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Social Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="OBC">OBC</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="income">Family Income (INR/yr)</Label>
                    <Input
                      id="income"
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(parseInt(e.target.value) || 0)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="school-type">School Type</Label>
                    <Select value={schoolType} onValueChange={setSchoolType}>
                      <SelectTrigger id="school-type" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Govt">Government</SelectItem>
                        <SelectItem value="Govt Aided">Govt Aided</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subjects & Marks */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold text-slate-800">Subject-wise Marks</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSubject}
                      className="h-8 text-xs bg-transparent border-dashed text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1">
                    {subjects.map((sub, i) => (
                      <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Input
                          value={sub.name}
                          onChange={(e) => handleSubjectChange(i, "name", e.target.value)}
                          className="h-9 text-xs bg-white flex-1"
                        />
                        <Input
                          type="number"
                          value={sub.marks}
                          onChange={(e) => handleSubjectChange(i, "marks", e.target.value)}
                          className="h-9 text-xs bg-white w-16 text-center font-mono font-bold"
                          min="0"
                          max="100"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubject(i)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculated Percentage Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Percentage</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">Average calculated from subjects above</div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-600 font-mono">{percentage}%</span>
                  </div>
                </div>

                <Button onClick={handleConfirm} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/10 mt-6">
                  Confirm & Find Scholarships <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-slate-200 border-dashed rounded-2xl bg-slate-50/50">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-base font-semibold text-slate-700 mb-1">Waiting for Marksheet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Once you upload your marksheet PDF or photo, the AI will extract your grades and populate your profile here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
