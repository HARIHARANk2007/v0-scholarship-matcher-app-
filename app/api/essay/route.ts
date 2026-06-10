import { NextResponse } from "next/server"
import { generateWithFallback } from "@/lib/gemini"

function generateLocalEssay(
  scholarshipName: string,
  studentName: string,
  percentage: number,
  state: string,
  category: string,
  bullets: string[]
) {
  const bulletHighlights = bullets.map(b => b.trim()).filter(b => b.length > 0)
  const name = studentName || "a dedicated student"
  const stateStr = state ? `from ${state}` : ""
  const catStr = category && category !== "General" ? `representing the ${category} community` : ""

  const highlightsText = bulletHighlights.length > 0
    ? `Specifically, I want to highlight that ${bulletHighlights.join(". Furthermore, ") || "I am committed to my studies and have always worked hard to achieve academic excellence"}.`
    : "I am committed to my studies and have always worked hard to achieve academic excellence."

  return `Dear Scholarship Committee,

My name is ${name}${stateStr ? " and I am " + stateStr : ""}${catStr ? ", " + catStr : ""}. I am applying for the "${scholarshipName}" to support my educational journey. Academically, I have always pushed myself to succeed, achieving a percentage of ${percentage}% in my studies. This milestone is a testament to my dedication and resolve.

${highlightsText}

Receiving this scholarship would significantly reduce the financial burden on my family and enable me to focus entirely on my higher education goals. It will empower me to continue my academic journey, acquire new skills, and contribute positively to my community. Thank you very much for considering my application.

Sincerely,
${studentName || "Applicant"}`
}

export async function POST(req: Request) {
  const body = await req.json()
  const { bullets, scholarshipName, studentName, percentage, state, category } = body

  if (!bullets || bullets.length < 1) {
    return NextResponse.json({ error: "Please provide at least one bullet point." }, { status: 400 })
  }

  const bulletList = bullets
    .filter((b: string) => b.trim().length > 0)
    .map((b: string, i: number) => `${i + 1}. ${b}`)
    .join("\n")

  try {
    const prompt = `You are helping an Indian student write a scholarship application essay.

Write a genuine, personal, 200-word essay for ${studentName || "a student"} applying for "${scholarshipName}".

Student background:
- Academic percentage: ${percentage}%
- State: ${state || "India"}
- Category: ${category || "General"}

Key points the student wants to highlight:
${bulletList}

Rules:
- Write entirely in first person
- Sound authentic and personal, not like a template
- Be specific about the student's situation
- Show ambition and gratitude
- DO NOT start with "I am writing to express..." or similar clichés
- DO NOT use headers or bullet points — write one flowing essay
- Target exactly 200 words`

    const essay = await generateWithFallback(prompt, {
      maxOutputTokens: 500,
      temperature: 0.85,
    })

    if (!essay) {
      throw new Error("Empty response from AI")
    }

    return NextResponse.json({ essay })
  } catch (error: any) {
    console.warn("Essay generation failed, falling back to local template:", error)
    const fallbackEssay = generateLocalEssay(
      scholarshipName,
      studentName,
      Number(percentage || 0),
      state,
      category,
      bullets
    )
    return NextResponse.json({ essay: fallbackEssay })
  }
}

