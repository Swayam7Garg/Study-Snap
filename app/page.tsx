"use client";

import { useState } from 'react';
import InputPanel from '@/components/InputPanel';
import SummaryView from '@/components/SummaryView';
import QuizView from '@/components/QuizView';
import KeyTermsView from '@/components/KeyTermsView';
import DownloadButton from '@/components/DownloadButton';
import { callGemini } from '@/lib/gemini';

export interface StudyResult {
  summary: string;
  key_terms: KeyTerm[];
  quiz: QuizItem[];
}

export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [questionCount, setQuestionCount] = useState(5);

  const [result, setResult] = useState<StudyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"summary" | "quiz" | "terms">("summary");

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please put some text before generating.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await callGemini(inputText, difficulty, questionCount);
      console.log(data)
      // const res = await fetch('/api/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: inputText, difficulty, questionCount })
      // });

      setResult(data);
      setActiveTab("summary");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Column: Input */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            StudySnap ✨
          </h1>
          <p className="text-slate-400">
            AI-powered study notes summariser and quiz generator.
          </p>
          <InputPanel
            inputText={inputText}
            setInputText={setInputText}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
          />
        </div>

        {/* Right Column: Output Tabs */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {result ? (
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700/50 flex flex-col h-full animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 mb-6 gap-4">
                <div className="flex space-x-6 overflow-x-auto w-full sm:w-auto">
                  {(["summary", "quiz", "terms"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab
                        ? "text-violet-400 border-b-2 border-violet-400"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      {tab === "summary" && "📑 Summary"}
                      {tab === "quiz" && "🎯 Practice Quiz"}
                      {tab === "terms" && "📖 Key Terms"}
                    </button>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <DownloadButton />
                </div>
              </div>

              <div className="flex-grow overflow-auto">
                {activeTab === "summary" && <SummaryView summary={result.summary} />}
                {activeTab === "quiz" && <QuizView quiz={result.quiz} />}
                {activeTab === "terms" && <KeyTermsView keyTerms={result.key_terms} />}
              </div>

              <div className="mt-6 sm:hidden border-t border-slate-700 pt-4 flex justify-center">
                <DownloadButton />
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700/50 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">Ready to Learn?</h3>
              <p className="text-slate-500 max-w-sm">
                Paste your text or upload a document to generate an AI study guide tailored to your needs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Export Structure */}
      {result && (
        <div className="absolute top-[-10000px] left-[-10000px] w-[800px] z-[-50]">
          <div id="pdf-export" className="p-10 bg-white text-black text-sm font-sans">
            <h1 className="text-3xl font-bold mb-6 text-violet-800 border-b pb-2">StudySnap Notes</h1>

            <h2 className="text-2xl font-semibold mt-8 mb-4 text-violet-700">Summary</h2>
            <div className="mb-6 leading-relaxed text-gray-800">
               {result.summary}
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-violet-700">Quiz with Answers</h2>
            {result.quiz.map((q, i) => (
              <div key={i} className="mb-4 p-4 border rounded-lg border-gray-300">
                <p className="font-bold mb-2">{i + 1}. {q.question}</p>
                <ul className="list-none pl-0">
                  {q.options.map((opt, j) => {
                    const isCorrect = opt === q.answer;
                    return (
                      <li key={j} className={`mb-1 p-1 ${isCorrect ? "bg-green-100 font-medium text-green-900 border border-green-200 rounded" : ""}`}>
                        {isCorrect ? "✓ " : "• "} {opt}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-violet-700">Key Terms</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-2.5 px-4 w-1/3 font-bold">Term</th>
                  <th className="py-2.5 px-4 w-2/3 font-bold">Definition</th>
                </tr>
              </thead>
              <tbody>
                {result.key_terms.map((kt, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2.5 px-4 font-bold text-violet-900 align-top">{kt.term}</td>
                    <td className="py-2.5 px-4 text-gray-800">{kt.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
