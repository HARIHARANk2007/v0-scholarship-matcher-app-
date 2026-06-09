export interface StudentProfile {
  name: string;
  percentage: number;
  income: number;
  category: string;
  state: string;
  schoolType: string;
}

export interface ScholarshipProfile {
  name: string;
  minPercentage: number | null;
  maxIncome: number | null;
  categories: string[];
  states: string[];
  schoolTypes: string[];
}

/**
 * Fallback to generate a highly personalized explanation locally when no API key is present.
 * Generates natural sentences like: "You qualify because your 87% exceeds the 75% cutoff and you're from Tamil Nadu."
 */
export function generateLocalExplanation(student: StudentProfile, scholarship: ScholarshipProfile): string {
  const reasons: string[] = [];

  if (scholarship.minPercentage !== null) {
    const diff = student.percentage - scholarship.minPercentage;
    reasons.push(`your ${student.percentage}% exceeds the ${scholarship.minPercentage}% cutoff`);
  }

  if (scholarship.maxIncome !== null) {
    reasons.push(`your family income of ₹${student.income.toLocaleString()} is below the ₹${scholarship.maxIncome.toLocaleString()} limit`);
  }

  if (scholarship.states && scholarship.states.length > 0 && scholarship.states.includes(student.state)) {
    reasons.push(`you're from ${student.state}`);
  }

  if (scholarship.schoolTypes && scholarship.schoolTypes.length > 0 && scholarship.schoolTypes.includes(student.schoolType)) {
    reasons.push(`you attended a ${student.schoolType} school`);
  }

  if (scholarship.categories && scholarship.categories.length > 0 && scholarship.categories.includes(student.category)) {
    reasons.push(`you belong to the ${student.category} category`);
  }

  if (reasons.length === 0) {
    return `You qualify for ${scholarship.name} because you meet all eligibility requirements.`;
  }

  // Format reasons into a natural sentence
  let sentence = "You qualify because ";
  if (reasons.length === 1) {
    sentence += reasons[0];
  } else if (reasons.length === 2) {
    sentence += `${reasons[0]} and ${reasons[1]}`;
  } else {
    const last = reasons.pop();
    sentence += `${reasons.join(", ")}, and ${last}`;
  }
  sentence += ".";

  return sentence;
}

/**
 * Call the Gemini API to generate a personalized explanation.
 */
export async function getAIExplanation(student: StudentProfile, scholarship: ScholarshipProfile): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fall back to local explanation if API key is not configured
  if (!apiKey) {
    return generateLocalExplanation(student, scholarship);
  }

  try {
    const prompt = `Write a short, friendly, plain-language explanation (maximum 2 sentences) for why this student qualifies for the scholarship. Personalize it.
    
Student Profile:
- Name: ${student.name}
- Academic Percentage: ${student.percentage}%
- Family Income: ₹${student.income.toLocaleString()}/yr
- Category: ${student.category}
- State: ${student.state}
- School Type: ${student.schoolType}

Scholarship:
- Name: ${scholarship.name}
- Minimum Percentage: ${scholarship.minPercentage !== null ? scholarship.minPercentage + '%' : 'None'}
- Maximum Income Allowed: ${scholarship.maxIncome !== null ? '₹' + scholarship.maxIncome.toLocaleString() + '/yr' : 'None'}
- Eligible Categories: ${scholarship.categories && scholarship.categories.length > 0 ? scholarship.categories.join(', ') : 'All'}
- Eligible States: ${scholarship.states && scholarship.states.length > 0 ? scholarship.states.join(', ') : 'All'}
- Eligible School Types: ${scholarship.schoolTypes && scholarship.schoolTypes.length > 0 ? scholarship.schoolTypes.join(', ') : 'All'}

Start the explanation directly without introductory phrases like "Here is the explanation". Keep it extremely concise and direct, similar to: "You qualify because your 87% exceeds the 75% cutoff and you're from Tamil Nadu."`;

    const modelName = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.2
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    }

    return generateLocalExplanation(student, scholarship);
  } catch (err) {
    console.error("Error fetching explanation from Gemini:", err);
    return generateLocalExplanation(student, scholarship);
  }
}
