import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { scholarshipName, tags, category, state, income, schoolType } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const prompt = `Generate a document checklist for an Indian student applying for the scholarship: "${scholarshipName}".

Scholarship type/tags: ${Array.isArray(tags) ? tags.join(", ") : "General"}
Student social category: ${category || "General"}
Student state: ${state || "India"}
Annual family income: ₹${income ? Number(income).toLocaleString() : "N/A"}
School type: ${schoolType || "Government"}

Return ONLY a raw JSON array — no markdown fences, no explanation, no trailing text. Use this exact structure:
[
  {
    "document": "Document name here",
    "description": "One sentence: what this is and where/how to get it.",
    "required": true
  }
]

Rules:
- Include 7 to 9 documents
- Always include: Aadhaar Card, Passport-size Photograph, Bank Passbook (first page), Marksheet (latest)
- Include income certificate if income is below 5 lakhs
- Include caste/category certificate if category is SC, ST, or OBC
- Include domicile/residence certificate for state government scholarships
- Include school bonafide letter
- Add any scholarship-specific documents based on its type
- Mark conditionally required documents as required: false
- Keep descriptions concise and actionable`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini error: ${err}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""

    // Robustly extract the JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Could not parse checklist from AI response")
    }

    const checklist = JSON.parse(jsonMatch[0]) as Array<{
      document: string
      description: string
      required: boolean
    }>

    return NextResponse.json({ checklist })
  } catch (error: any) {
    console.error("Checklist generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate checklist" }, { status: 500 })
  }
}
