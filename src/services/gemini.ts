import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI note-taking agent for debt collection and loan servicing calls.

Task: summarize the provided call transcript into structured internal case notes.

IMPORTANT EXECUTION RULES:
- Start writing the answer immediately.
- Do NOT overthink or re-check earlier sections.
- If information is unclear or missing, write "Not mentioned" and move on.
- Do not attempt to perfect the output.

OUTPUT LIMITS:
- Maximum 400 words total.
- Use concise bullet points.
- Do not exceed 6 bullets per section.

STRUCTURE (use these exact headers):

1. Call Metadata
2. Key Facts (explicitly stated only)
3. Customer Situation
4. Agent Actions
5. Customer Commitments
6. Risks & Flags
7. Next Steps

STYLE:
- Neutral, factual, compliance-safe
- No assumptions, no opinions
- No invented details`;

let ai: GoogleGenAI | null = null;

export async function summarizeTranscript(transcript: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: transcript }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual, consistent output
      },
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Error summarizing transcript:", error);
    throw error;
  }
}
