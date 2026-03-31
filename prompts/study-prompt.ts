export function buildPrompt(text: string, difficulty: string, questionCount: number): string {
  return `Act as an expert study assistant. Your task is to analyze the provided text and generate a structured study guide.
  
  DIFFICULTY LEVEL: ${difficulty}
  QUERY TEXT: ${text}

  CRITICAL: Return ONLY a raw JSON object that follows this EXACT structure:
  {
    "summary": "A comprehensive paragraph summary of the text...",
    "key_terms": [
      { "term": "Term Name", "definition": "Clear concise definition" }
    ],
    "quiz": [
      {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The exact string of the correct option"
      }
    ]
  }

  SPECIFICATIONS:
  1. Summary: A single well-written paragraph.
  2. Key Terms: 5-8 most important terms.
  3. Quiz: Exactly ${questionCount} questions matching the difficulty level.
  `;
}
