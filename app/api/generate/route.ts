import { NextResponse } from 'next/server';
import { callGemini } from '../../../lib/gemini';
import { buildPrompt } from '../../../prompts/study-prompt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, difficulty, questionCount } = body;

    // Validate text
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 4000) {
      return NextResponse.json({ error: "Text too long. Please paste under 4000 words." }, { status: 400 });
    }

    // Validate difficulty
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    // Validate question count
    if (typeof questionCount !== 'number' || questionCount < 3 || questionCount > 10) {
      return NextResponse.json({ error: "Question count must be 3–10" }, { status: 400 });
    }

    // Build the prompt
    const prompt = buildPrompt(text, difficulty, questionCount);
    
    // Call Gemini
    let geminiResponseString: string;
    try {
      geminiResponseString = await callGemini(text, difficulty, questionCount);
    } catch (error: any) {
      // Check for rate limit error (429) from Gemini SDK
      if (error.message && (error.message.includes("429") || error.message.includes("Too Many Requests"))) {
        return NextResponse.json({ 
          error: "Gemini API rate limit reached (Free Tier). Please wait 60 seconds and try again." 
        }, { status: 429 });
      }
      return NextResponse.json({ error: "Gemini API call failed: " + error.message }, { status: 500 });
    }

    // Strip out markdown formatting if present
    let cleanJsonString = geminiResponseString.trim();
    if (cleanJsonString.startsWith('```')) {
      cleanJsonString = cleanJsonString.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
    }

    // Parse the JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanJsonString);
    } catch (error) {
       return NextResponse.json({ error: "AI returned malformed JSON. Please try again." }, { status: 500 });
    }

    // Validate required fields
    if (!parsedResponse.summary || !parsedResponse.quiz || !parsedResponse.keyTerms) {
      return NextResponse.json({ error: "AI response missing required fields." }, { status: 500 });
    }

    // Success response
    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
