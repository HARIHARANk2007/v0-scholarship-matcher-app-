import { generateWithFallback } from "./gemini";

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
 * Server-side in-memory cache so repeated page loads or profile checks
 * don't re-call the Gemini API and blow through the free-tier RPM quota.
 * Key format: "<studentKey>|<scholarshipName>"
 */
const explanationCache = new Map<string, string>();

function buildCacheKey(student: StudentProfile, scholarship: ScholarshipProfile): string {
  return `${student.name}|${student.percentage}|${student.income}|${student.category}|${student.state}|${student.schoolType}||${scholarship.name}`;
}

/**
 * Fallback – generates a plain-language explanation locally (zero network calls).
 * Example output: "You qualify because your 87% exceeds the 75% cutoff and you're from Tamil Nadu."
 */
export function generateLocalExplanation(student: StudentProfile, scholarship: ScholarshipProfile): string {
  const reasons: string[] = [];

  if (scholarship.minPercentage !== null) {
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
 * Calls the Gemini API to generate a personalised explanation.
 * Results are cached in-memory so repeated calls for the same
 * student+scholarship pair never hit the network more than once.
 */
export async function getAIExplanation(student: StudentProfile, scholarship: ScholarshipProfile): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fall back to local explanation if API key is not configured
  if (!apiKey) {
    return generateLocalExplanation(student, scholarship);
  }

  // --- Cache check ---
  const cacheKey = buildCacheKey(student, scholarship);
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey)!;
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

    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 150,
      temperature: 0.2
    });

    if (result) {
      // Store in cache for future requests
      explanationCache.set(cacheKey, result);
      return result;
    }

    return generateLocalExplanation(student, scholarship);
  } catch (err) {
    console.error("Error fetching explanation from Gemini:", err);
    return generateLocalExplanation(student, scholarship);
  }
}
