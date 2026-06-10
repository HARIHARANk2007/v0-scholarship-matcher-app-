import { NextResponse } from "next/server"
import { generateWithFallback } from "@/lib/gemini"

function generateLocalChecklist(
  scholarshipName: string,
  tags: string[],
  category: string,
  state: string,
  income: number | null,
  schoolType: string
) {
  const list = [
    {
      document: "Aadhaar Card",
      description: "Required for student identification and Aadhaar-based scholarship disbursement.",
      required: true
    },
    {
      document: "Passport-size Photograph",
      description: "Recent color photograph of the applicant.",
      required: true
    },
    {
      document: "Academic Marksheet",
      description: "Latest academic marksheet/report card showing your percentage and grade.",
      required: true
    },
    {
      document: "Bank Passbook (First Page)",
      description: "Copy of passbook or cancelled cheque showing account number and IFSC code.",
      required: true
    },
    {
      document: "School Bonafide Certificate",
      description: "Letter from your current school principal confirming your active enrollment.",
      required: true
    }
  ];

  if (income && income <= 500000) {
    list.push({
      document: "Income Certificate",
      description: "Official income certificate issued by competent authority (Tahsildar/Revenue officer).",
      required: true
    });
  }

  if (category && ["SC", "ST", "OBC", "MBC"].includes(category.toUpperCase())) {
    list.push({
      document: `${category} Caste Certificate`,
      description: `Community/caste certificate to verify eligibility for ${category} reservations.`,
      required: true
    });
  }

  const isStateSpecific = (tags || []).some(t => ["nsp", "state", "post-matric", "pre-matric"].includes(t.toLowerCase())) || (state && state.toLowerCase() !== "india");
  if (isStateSpecific) {
    list.push({
      document: "Domicile/Residence Certificate",
      description: `Proof of residence in ${state || "your state"} to verify state domicile criteria.`,
      required: true
    });
  }

  list.push({
    document: "Fee Receipt / Admission Proof",
    description: `Current academic year fee receipt or admission letter from the school/college.`,
    required: true
  });

  return list;
}

export async function POST(req: Request) {
  const body = await req.json()
  const { scholarshipName, tags, category, state, income, schoolType } = body

  try {
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

    const text = await generateWithFallback(prompt, {
      maxOutputTokens: 1000,
      temperature: 0.1,
    })

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
    console.warn("Checklist generation failed, falling back to local checklist:", error)
    const fallbackList = generateLocalChecklist(
      scholarshipName,
      tags || [],
      category,
      state,
      income ? Number(income) : null,
      schoolType
    )
    return NextResponse.json({ checklist: fallbackList })
  }
}

