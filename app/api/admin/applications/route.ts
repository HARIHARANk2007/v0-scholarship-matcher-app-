import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const applications = await db.application.findMany({
      include: {
        user: true,
        scholarship: true
      }
    })

    return NextResponse.json({ applications })
  } catch (error: any) {
    console.error("Admin list applications error:", error)
    return NextResponse.json({ error: error.message || "Failed to load applications" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing application ID or status" }, { status: 400 })
    }

    const updated = await db.application.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ success: true, application: updated })
  } catch (error: any) {
    console.error("Admin update application status error:", error)
    return NextResponse.json({ error: error.message || "Failed to update application status" }, { status: 500 })
  }
}
