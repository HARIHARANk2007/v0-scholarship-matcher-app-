import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyData } from "@/lib/data"
import { FileText, GraduationCap, TrendingUp, AlertCircle, ArrowRight, Clock } from "lucide-react"

export default function DashboardPage() {
  const { user, stats, upcomingDeadlines, scholarships } = dummyData

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{stats.matchScore}%</div>
            <p className="text-xs text-slate-500 mt-1">Based on your profile</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Eligible Scholarships</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{stats.eligibleScholarships}</div>
            <p className="text-xs text-slate-500 mt-1">Ready to apply</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-500">Documents</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900">{stats.documentsUploaded}</div>
            <p className="text-xs text-slate-500 mt-1">Uploaded securely</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Upcoming Deadlines */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Upcoming Deadlines</h2>
            <Link href="/matches" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> Deadline: {item.deadline}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600/10">
                    {item.daysLeft} days left
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hidden group-hover:flex mt-2 h-8 ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Apply Now <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scholarships / Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Recent Matches</h2>
          <div className="space-y-4">
            {scholarships.slice(0, 3).map((scholarship) => (
              <Card
                key={scholarship.id}
                className="bg-white border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {scholarship.name}
                    </h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {scholarship.match}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{scholarship.reason}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">₹{scholarship.amount.toLocaleString()}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Link href="/matches">
              <Button
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 bg-transparent"
              >
                View All Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
