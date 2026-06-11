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

    const body = await req.json()
    const { name, class: className, percentage, income, category, state, schoolType, fileName } = body

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        class: className,
        percentage: percentage ? parseFloat(percentage) : null,
        income: income ? parseInt(income) : null,
        category,
        state,
        schoolType,
      },
    })

    // If fileName is provided, register a Document record for this user
    if (fileName) {
      const existingDocs = await db.document.findMany({
        where: {
          userId: session.user.id,
          fileName: fileName,
        },
      })

      if (existingDocs.length === 0) {
        await db.document.create({
          data: {
            userId: session.user.id,
            type: "MARKSHEET",
            fileName: fileName,
            fileUrl: "/placeholder.pdf", // Mock URL
            fileSize: 102400, // Mock size 100KB
            mimeType: fileName.endsWith(".pdf") ? "application/pdf" : "image/png",
          },
        })
      }
    }

    return NextResponse.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name } })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
