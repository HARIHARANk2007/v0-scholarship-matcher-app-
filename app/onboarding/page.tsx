import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, FileText, CheckCircle, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900">How EduBridge+ Works</h1>
        <p className="mt-4 text-slate-600">Get started in 3 simple steps</p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">Create Profile</h3>
            <p className="text-slate-600">
              Sign up and tell us a bit about yourself. Your background helps us find relevant opportunities.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">Upload Documents</h3>
            <p className="text-slate-600">
              Upload your marksheets and income certificates. Our AI extracts the details automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">Get Matched</h3>
            <p className="text-slate-600">View your personalized scholarship matches and apply with a single click.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Link href="/dashboard">
          <Button
            size="lg"
            className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700"
          >
            Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
