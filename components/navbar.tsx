import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>
            EduBridge<span className="text-blue-600">+</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/upload" className="hover:text-blue-600 transition-colors">
            Upload
          </Link>
          <Link href="/matches" className="hover:text-blue-600 transition-colors">
            Matches
          </Link>
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">Login</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
