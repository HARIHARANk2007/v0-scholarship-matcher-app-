import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dummyData } from "@/lib/data"
import { Clock, ArrowRight, Filter } from "lucide-react"

export default function MatchesPage() {
  const { scholarships } = dummyData

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Scholarship Matches</h1>
          <p className="text-muted-foreground mt-1">
            AI analyzed your marks and found {scholarships.length} opportunities.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" /> Filter Results
        </Button>
      </div>

      <div className="grid gap-6">
        {scholarships.map((scholarship) => (
          <Card
            key={scholarship.id}
            className="bg-card border-border/50 hover:border-primary/50 transition-all group overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Match Score Indicator */}
              <div className="w-full md:w-32 bg-accent/30 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-border/50">
                <div
                  className={`text-3xl font-bold ${
                    scholarship.match >= 90
                      ? "text-secondary"
                      : scholarship.match >= 80
                        ? "text-primary"
                        : "text-orange-500"
                  }`}
                >
                  {scholarship.match}%
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Match</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {scholarship.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 border-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{scholarship.name}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{scholarship.reason}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-2xl font-bold">₹{scholarship.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Grant Amount</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
                  <div className="flex items-center text-sm text-muted-foreground w-full sm:w-auto">
                    <Clock className="h-4 w-4 mr-2 text-destructive" />
                    Deadline: <span className="text-foreground font-medium ml-1">{scholarship.deadline}</span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link href="/application" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    <Link href="/application" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto gap-2">
                        Auto-Fill Application <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
