"use client";

import { useState, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import SummaryView from "@/components/SummaryView";
import QuizView from "@/components/QuizView";
import KeyTermsView from "@/components/KeyTermsView";
import FlashcardsView from "@/components/FlashcardsView";
import DownloadButton from "@/components/DownloadButton";
import { callGemini } from "@/lib/gemini";

export interface StudyResult {
  summary: string;
  key_terms: KeyTerm[];
  flashcards: KeyTerm[];
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

type Tab = "summary" | "quiz" | "terms" | "flashcards";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "summary",    label: "Summary",    icon: "📑" },
  { id: "quiz",       label: "Quiz",       icon: "🎯" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "terms",      label: "Key Terms",  icon: "📖" },
];

// ─── Animated background orbs ───────────────────────────────────
function BackgroundOrbs() {
  return (
    <>
      <div
        className="bg-orb w-[600px] h-[600px] opacity-30"
        style={{
          top: "-100px",
          left: "-100px",
          background: "radial-gradient(circle, rgba(109,40,217,0.6) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="bg-orb w-[500px] h-[500px] opacity-20"
        style={{
          bottom: "-80px",
          right: "-80px",
          background: "radial-gradient(circle, rgba(20,184,166,0.6) 0%, transparent 70%)",
          animationDelay: "-5s",
        }}
      />
      <div
        className="bg-orb w-[300px] h-[300px] opacity-15"
        style={{
          top: "40%",
          left: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)",
          animationDelay: "-9s",
        }}
      />
    </>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50 space-y-6 animate-in fade-in duration-300">
      <div className="flex gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-8 flex-1 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-5/6 rounded" />
      <div className="skeleton h-4 w-4/6 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────── 
function Hero() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/40 glow-pulse">
          ✨
        </div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
          StudySnap
        </h1>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">
        Paste your notes, get an AI-powered summary, quiz, flashcards & key terms — instantly.
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
        {["🧠 AI Summaries", "🎯 MCQ Quiz", "🃏 Flashcards", "⬇ PDF Export"].map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-violet-950/60 border border-violet-800/50 text-violet-300 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats bar shown after generation ────────────────────────────
function StatsBar({ result }: { result: StudyResult }) {
  const stats = [
    { label: "Quiz Qs", value: result.quiz.length, icon: "🎯" },
    { label: "Key Terms", value: result.key_terms.length, icon: "📖" },
    { label: "Flashcards", value: result.flashcards?.length ?? 0, icon: "🃏" },
  ];
  return (
    <div className="flex gap-3 flex-wrap">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm"
        >
          <span>{s.icon}</span>
          <span className="text-violet-300 font-bold">{s.value}</span>
          <span className="text-slate-400">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [result, setResult] = useState<StudyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [tabKey, setTabKey] = useState(0); // force re-mount on tab switch for animation

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please paste or upload some study text first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await callGemini(inputText, difficulty, questionCount);
      // Fallback: if flashcards missing, use key_terms
      if (!data.flashcards || data.flashcards.length === 0) {
        data.flashcards = data.key_terms ?? [];
      }
      setResult(data);
      setActiveTab("summary");
      setTabKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* ── Main layout ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Input panel ── */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-5">
            <Hero />
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
            {result && <StatsBar result={result} />}
          </div>

          {/* ── RIGHT: Output ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <LoadingSkeleton />
            ) : result ? (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-950/50 flex flex-col">
                {/* Tab bar */}
                <div className="flex items-center justify-between border-b border-slate-700/60 px-5 pt-4 pb-0 gap-4 flex-wrap">
                  <div className="flex gap-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200 ${
                          activeTab === tab.id
                            ? "text-violet-300 bg-slate-900/60"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="pb-2">
                    <DownloadButton />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 overflow-auto" style={{ maxHeight: "80vh" }}>
                  <div key={tabKey} className="tab-content-enter">
                    {activeTab === "summary"    && <SummaryView    summary={result.summary} />}
                    {activeTab === "quiz"       && <QuizView       quiz={result.quiz} />}
                    {activeTab === "flashcards" && <FlashcardsView flashcards={result.flashcards ?? result.key_terms} />}
                    {activeTab === "terms"      && <KeyTermsView   keyTerms={result.key_terms} />}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="h-full min-h-[500px] bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 border-dashed flex flex-col items-center justify-center text-center p-12 gap-6">
                <div className="relative">
                  <div className="text-7xl select-none" style={{ filter: "drop-shadow(0 0 30px rgba(109,40,217,0.4))" }}>
                    📚
                  </div>
                  <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full bg-violet-600 animate-ping opacity-60" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">Ready to StudySnap?</h3>
                  <p className="text-slate-500 max-w-sm leading-relaxed">
                    Paste lecture notes, a chapter excerpt, or upload a PDF/TXT file — and get your AI study kit in seconds.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-left">
                  {[
                    { icon: "📑", title: "Smart Summary", desc: "Structured key takeaways" },
                    { icon: "🎯", title: "MCQ Quiz", desc: "Test your knowledge live" },
                    { icon: "🃏", title: "Flashcards", desc: "Flip-card revision mode" },
                    { icon: "📖", title: "Key Terms", desc: "Term + definition table" },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-violet-700/50 transition-colors"
                    >
                      <div className="text-2xl mb-1.5">{f.icon}</div>
                      <div className="text-sm font-semibold text-slate-300">{f.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hidden PDF export DOM ── */}
      {result && (
        <div className="absolute top-[-10000px] left-[-10000px] w-[800px] z-[-50]">
          <div id="pdf-export" className="p-10 bg-white text-black text-sm font-sans">
            <h1 className="text-3xl font-bold mb-2 text-violet-800">StudySnap — Study Guide</h1>
            <p className="text-slate-500 mb-6 text-xs">Generated by StudySnap AI • {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4 text-violet-700 border-b pb-2">📑 Summary</h2>
            <div className="mb-6 leading-relaxed text-gray-800 whitespace-pre-wrap">{result.summary}</div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-violet-700 border-b pb-2">📖 Key Terms</h2>
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-2.5 px-4 w-1/3 font-bold bg-violet-50">Term</th>
                  <th className="py-2.5 px-4 w-2/3 font-bold bg-violet-50">Definition</th>
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

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-violet-700 border-b pb-2">🎯 Quiz with Answers</h2>
            {result.quiz.map((q, i) => (
              <div key={i} className="mb-5 p-4 border rounded-lg border-gray-300">
                <p className="font-bold mb-3">{i + 1}. {q.question}</p>
                <ul className="list-none pl-0 space-y-1">
                  {q.options.map((opt, j) => {
                    const isCorrect = opt === q.answer;
                    return (
                      <li
                        key={j}
                        className={`p-2 rounded text-sm ${
                          isCorrect
                            ? "bg-green-100 font-medium text-green-900 border border-green-300"
                            : "text-gray-700"
                        }`}
                      >
                        {isCorrect ? "✓ " : `${["A","B","C","D"][j]}. `}{opt}
                      </li>
                    );
                  })}
                </ul>
                {q.explanation && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
