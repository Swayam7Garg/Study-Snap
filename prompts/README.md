# Prompt Engineering Strategy for StudySnap

## Overview
This document outlines the prompt engineering principles used for StudySnap's core AI generation engine, which is powered by multiple parameter injections into the `gemini-1.5-flash` generation call.

## Why One JSON Call vs. Three Calls?
We deliberately perform a single API call to concurrently produce the summary, quiz, and key terms arrays. This avoids three separate LLM calls, providing the following advantages:
1. **Speed and Cost**: Generative API calls inherently have overhead and cost latency tokens. Producing unified JSON structure reduces "Time To First Byte" significantly and stays within the standard Gemini prompt limitations smoothly.
2. **Context Coherence**: Running queries simultaneously ensures the Quiz conceptually matches the Summary, and the Key Terms overlap effectively with definitions asked in the Quiz.
3. **Failsafe Parsing**: Rather than coordinating three asynchronous JSON decodes, we retrieve one object payload mapping perfectly to the UI requirements.

## Full Prompt Template

```text
Act as an expert study assistant. Your task is to analyze the provided text and generate a structured study guide containing a summary, a quiz, and a list of key terms.

CRITICAL INSTRUCTIONS:
- Return ONLY a raw JSON object.
- NO markdown formatting, NO backticks (\`\`\`json), NO explanations, NO preamble or postamble whatsoever.
- The VERY FIRST character of your response MUST be '{' and the last character must be '}'.

The JSON object must EXACTLY match the following shape:
{
  "summary": [
    { "heading": "Topic Name", "bullets": ["point 1", "point 2", "point 3"] }
  ],
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ],
  "keyTerms": [
    { "term": "Term name", "definition": "Clear concise definition" }
  ]
}

SPECIFICATIONS:
1. Summary: Extract 4-7 distinct topic sections. Each section must have exactly 3-5 concise, exam-focused bullets.
2. Quiz: Generate exactly {{questionCount}} questions.
3. Key Terms: Extract 6-10 of the most important domain-specific terms from the text and define them in plain English.

DIFFICULTY LEVEL: {{difficulty}}
Adjust the quiz questions based on this difficulty:
- Easy: Direct recall, "What is X?", "Which of these defines Y?"
- Medium: Application, "Which scenario best demonstrates X?", comparisons.
- Hard: Inference, edge cases, "Which of the following would NOT be true if X?"

TEXT TO ANALYZE:
{{text}}
```

## Parameter Injections

- `{{text}}`: The raw text to process. Sandboxed at the end of the prompt sequence to prevent prompt injection or LLM confusion when interpreting arbitrary reading lengths.
- `{{questionCount}}`: The exact integer volume of questions. Injected directly into specification parameters to maintain firm, unshakeable bounds.
- `{{difficulty}}`: Configures the cognitive depth of generated test questions.
  - **Easy**: Evaluates foundational facts.
  - **Medium**: Evaluates conceptual relations and logical connections.
  - **Hard**: Evaluates edge cases, reverse logic, and structural abstraction mapping.

## Model Configuration

We deliberately configure `temperature: 0.3` for all generations in `lib/gemini.ts`.
*Why 0.3?* We prioritize strictly bounded structural alignment (a rigid JSON signature) over highly creative prose variation. Higher temperatures (0.7-1.0) inherently increase stochastic token generation, heavily amplifying the risk of backticks, preamble formatting ("Here is the JSON..."), and invalid property identifiers. A 0.3 temperature maximizes predictability and API parsing safety.
