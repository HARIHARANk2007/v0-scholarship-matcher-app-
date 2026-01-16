"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { AuthProvider } from "@/components/auth-provider"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Show Navbar on landing page, onboarding, and login, Sidebar on everything else
  const isPublic = pathname === "/" || pathname === "/onboarding" || pathname === "/login" || pathname === "/register"

  if (isPublic) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          {pathname !== "/login" && pathname !== "/register" && <Navbar />}
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
