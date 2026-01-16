"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Topbar() {
  const pathname = usePathname()

  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard"
    if (pathname.includes("/upload")) return "Upload Marksheet"
    if (pathname.includes("/matches")) return "Scholarship Matches"
    if (pathname.includes("/application")) return "Auto-Fill Application"
    if (pathname.includes("/admin")) return "Admin Dashboard"
    return "Dashboard"
  }

  return (
    <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-800">{getTitle()}</h1>

      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search..." className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
        </div>

        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
          <Settings className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8 border border-slate-200 cursor-pointer">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
