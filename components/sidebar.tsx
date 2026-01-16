"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Upload, FileText, GraduationCap, LogOut, User } from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Upload, label: "Upload Marks", href: "/upload" },
  { icon: GraduationCap, label: "Matches", href: "/matches" },
  { icon: FileText, label: "Application", href: "/application" },
  { icon: User, label: "Admin", href: "/admin" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-blue-100 bg-gradient-to-b from-blue-50 to-white flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-blue-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>
            EduBridge<span className="text-blue-600">+</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 mb-1 font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-blue-100">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  )
}
