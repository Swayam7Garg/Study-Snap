export function buildPrompt(text: string, difficulty: string, questionCount: number): string {
  return `Act as an expert study assistant. Analyze the provided text and generate a comprehensive structured study guide.

  DIFFICULTY LEVEL: ${difficulty}
  QUERY TEXT: ${text}

  CRITICAL: Return ONLY a raw JSON object that follows this EXACT structure (no markdown fences, no extra text):
  {
    "summary": "A comprehensive, well-structured summary using bullet points and topic headings where appropriate. Use \\n\\n to separate sections.",
    "key_terms": [
      { "term": "Term Name", "definition": "Clear, concise, student-friendly definition" }
    ],
    "flashcards": [
      { "term": "Concept or question on front of card", "definition": "Answer or explanation on back of card" }
    ],
    "quiz": [
      {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The exact string of the correct option from options array",
        "explanation": "Brief explanation of why this answer is correct and others are not"
      }
    ]
  }

  SPECIFICATIONS:
  1. Summary: Well-structured with topic headings and bullet points. Use \\n for newlines within the JSON string.
  2. Key Terms: 6-10 most important terms with clear definitions.
  3. Flashcards: 6-10 cards — these can be the same as key terms but phrased as question→answer pairs for better self-testing. Make some cards question-based (e.g. "What is X?" → "X is...").
  4. Quiz: Exactly ${questionCount} MCQ questions matching the ${difficulty} difficulty level. Include an explanation for each answer.
  5. All options in quiz must be plausible — avoid obviously wrong distractors at Easy level, use very similar distractors at Hard level.
  `;
}
