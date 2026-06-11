import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scholarshipName } = await req.json()

    // Find a scholarship in the database to link this application to
    // We search for a seeded NSP scholarship, or fall back to any available scholarship
    let scholarship = await db.scholarship.findFirst({
      where: {
        name: {
          contains: scholarshipName || "NSP",
          mode: "insensitive"
        }
      }
    })

    if (!scholarship) {
      scholarship = await db.scholarship.findFirst()
    }

    if (!scholarship) {
      return NextResponse.json({ error: "No scholarships found to link application" }, { status: 404 })
    }

    // Upsert Application table record (status = PENDING for draft)
    const application = await db.application.upsert({
      where: {
        userId_scholarshipId: {
          userId: session.user.id,
          scholarshipId: scholarship.id
        }
      },
      update: {
        status: "PENDING",
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        scholarshipId: scholarship.id,
        status: "PENDING"
      }
    })

    return NextResponse.json({ success: true, applicationId: application.id, scholarshipName: scholarship.name })
  } catch (error: any) {
    console.error("Save application draft error:", error)
    return NextResponse.json({ error: error.message || "Failed to save draft" }, { status: 500 })
  }
}
