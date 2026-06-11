interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Executes a text generation prompt with a dual-layer model fallback strategy:
 * 1. Attempts to use gemini-2.5-flash with a thinkingBudget of 0 to bypass reasoning overhead.
 * 2. If it encounters a rate limit, high demand, or server failure, it falls back to gemini-1.5-flash (excluding thinkingConfig to ensure compatibility).
 */
export async function generateWithFallback(prompt: string, options: GeminiOptions = {}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // 1. Try gemini-2.5-flash (v1beta)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens ?? 1000,
          temperature: options.temperature ?? 0.2,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } else {
      const errText = await response.text();
      console.warn(`Gemini 2.5 Flash request failed with status: ${response.status}. Error: ${errText}`);
    }
  } catch (err) {
    console.warn("Error calling Gemini 2.5 Flash:", err);
  }

  // 2. Fall back to gemini-1.5-flash (v1beta)
  try {
    console.log("Attempting fallback to gemini-1.5-flash...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens ?? 1000,
          temperature: options.temperature ?? 0.2
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }

    const errText = await response.text();
    throw new Error(`Gemini 1.5 Flash failed: ${response.status} - ${errText}`);
  } catch (err: any) {
    console.error("Gemini 1.5 fallback failed:", err);
    throw err;
  }
}
