// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "../prompts/study-prompt";

export async function callGemini(text: string, difficulty: string, questionCount: number) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY NOT SET");
  }

  const ai = new GoogleGenAI({ apiKey });
  try {

    const prompt = buildPrompt(text, difficulty, questionCount);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt + "Return only the JSON object, nothing else.",
    });
    console.log(response.text);
    // Parse the JSON (stripping markdown if present)
    // @ts-ignore
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to make Gemini API call");
  }
}
