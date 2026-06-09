"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Topbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard"
    if (pathname.includes("/upload")) return "Upload Marksheet"
    if (pathname.includes("/matches")) return "Scholarship Matches"
    if (pathname.includes("/application")) return "Auto-Fill Application"
    if (pathname.includes("/admin")) return "Admin Dashboard"
    return "Dashboard"
  }

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "JD"

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 border border-slate-200 cursor-pointer hover:opacity-85 transition-opacity">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-md rounded-xl p-1 z-50">
            <DropdownMenuLabel className="font-normal px-2.5 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-slate-800 leading-none">{session?.user?.name || "Guest User"}</p>
                <p className="text-xs text-slate-400 leading-none truncate">{session?.user?.email || "guest@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border-slate-100" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="w-full flex items-center px-2.5 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/upload" className="w-full flex items-center px-2.5 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                Upload Marksheet
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-slate-100" />
            <DropdownMenuItem 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer font-medium"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
