import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { bullets, scholarshipName, studentName, percentage, state, category } = await req.json()

    if (!bullets || bullets.length < 1) {
      return NextResponse.json({ error: "Please provide at least one bullet point." }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured." }, { status: 500 })
    }

    const bulletList = bullets
      .filter((b: string) => b.trim().length > 0)
      .map((b: string, i: number) => `${i + 1}. ${b}`)
      .join("\n")

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.85,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini error: ${err}`)
    }

    const data = await response.json()
    const essay = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!essay) {
      throw new Error("Empty response from AI")
    }

    return NextResponse.json({ essay })
  } catch (error: any) {
    console.error("Essay generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate essay" }, { status: 500 })
  }
}
