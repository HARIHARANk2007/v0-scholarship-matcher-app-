import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

// GET — all scholarships
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const scholarships = await db.scholarship.findMany()
    return NextResponse.json({ scholarships })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — create new scholarship
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const body = await req.json()
    const scholarship = await db.scholarship.create({
      data: {
        name: body.name,
        amount: Number(body.amount),
        description: body.description || "",
        eligibility: body.eligibility || "",
        deadline: new Date(body.deadline),
        tags: Array.isArray(body.tags) ? body.tags : (body.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        minPercentage: body.minPercentage !== "" && body.minPercentage != null ? Number(body.minPercentage) : null,
        maxIncome: body.maxIncome !== "" && body.maxIncome != null ? Number(body.maxIncome) : null,
        categories: Array.isArray(body.categories) ? body.categories : [],
        states: Array.isArray(body.states) ? body.states : (body.states || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        schoolTypes: Array.isArray(body.schoolTypes) ? body.schoolTypes : [],
      }
    })
    return NextResponse.json({ scholarship }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT — update existing scholarship
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const scholarship = await db.scholarship.update({
      where: { id },
      data: {
        name: data.name,
        amount: Number(data.amount),
        description: data.description || "",
        eligibility: data.eligibility || "",
        deadline: new Date(data.deadline),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        minPercentage: data.minPercentage !== "" && data.minPercentage != null ? Number(data.minPercentage) : null,
        maxIncome: data.maxIncome !== "" && data.maxIncome != null ? Number(data.maxIncome) : null,
        categories: Array.isArray(data.categories) ? data.categories : [],
        states: Array.isArray(data.states) ? data.states : (data.states || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        schoolTypes: Array.isArray(data.schoolTypes) ? data.schoolTypes : [],
      }
    })
    return NextResponse.json({ scholarship })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — remove scholarship
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    await db.scholarship.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
