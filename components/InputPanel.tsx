"use client";

import { ChangeEvent, useRef, useState } from "react";

interface InputPanelProps {
  inputText: string;
  setInputText: (val: string) => void;
  difficulty: "Easy" | "Medium" | "Hard";
  setDifficulty: (val: "Easy" | "Medium" | "Hard") => void;
  questionCount: number;
  setQuestionCount: (val: number) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
}

const DIFFICULTIES: { level: "Easy" | "Medium" | "Hard"; emoji: string; color: string; activeClass: string }[] = [
  { level: "Easy",   emoji: "🌱", color: "text-emerald-400", activeClass: "bg-emerald-700 text-white shadow-lg shadow-emerald-700/30" },
  { level: "Medium", emoji: "🔥", color: "text-amber-400",   activeClass: "bg-amber-600  text-white shadow-lg shadow-amber-600/30"   },
  { level: "Hard",   emoji: "💀", color: "text-rose-400",    activeClass: "bg-rose-700   text-white shadow-lg shadow-rose-700/30"    },
];

export default function InputPanel({
  inputText, setInputText, difficulty, setDifficulty,
  questionCount, setQuestionCount, onGenerate, loading, error,
}: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const processFile = async (file: File) => {
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setInputText(ev.target.result as string);
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        setInputText(fullText.trim());
      } catch (err) {
        console.error("Failed to parse PDF", err);
        alert("Could not extract text from this PDF.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-slate-700/50 flex flex-col gap-5">
      {/* Textarea with drag-drop */}
      <div>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl transition-all duration-200 ${
            isDragging ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-slate-800" : ""
          }`}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste lecture notes, a chapter excerpt, or any study material here…&#10;&#10;Tip: You can also drag & drop a .txt or .pdf file!"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 min-h-[220px] max-h-[360px] text-slate-200 placeholder:text-slate-500 text-sm leading-relaxed focus:outline-none focus:border-violet-500 resize-y transition-all"
            style={{ fontFamily: "inherit" }}
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-violet-950/80 border-2 border-dashed border-violet-500 pointer-events-none">
              <div className="text-center">
                <div className="text-4xl mb-2">📂</div>
                <p className="text-violet-300 font-semibold">Drop your file here</p>
              </div>
            </div>
          )}
        </div>

        {/* Word/char counts + upload */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-3 text-xs text-slate-500">
            <span>{wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>{charCount.toLocaleString()} chars</span>
          </div>
          <div className="flex items-center gap-2">
            {inputText && (
              <button
                onClick={() => setInputText("")}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-rose-900/50 hover:text-rose-300 border border-slate-600 text-slate-400 transition"
              >
                Clear
              </button>
            )}
            <input
              type="file"
              accept=".txt,.pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg cursor-pointer transition text-slate-300 flex items-center gap-1.5"
            >
              📄 Upload
            </label>
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Difficulty
        </label>
        <div className="flex gap-2">
          {DIFFICULTIES.map(({ level, emoji, activeClass }) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                difficulty === level
                  ? activeClass
                  : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              <span>{emoji}</span>
              <span>{level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div>
        <div className="flex justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quiz Questions
          </label>
          <span className="text-sm font-bold text-violet-400 tabular-nums">
            {questionCount}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={3}
            max={10}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-slate-700 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed ${((questionCount - 3) / 7) * 100}%, #334155 ${((questionCount - 3) / 7) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1 px-0.5">
            <span>3</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-700/60 rounded-xl text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <span className="mt-0.5 flex-shrink-0">🚨</span>
          <span>{error}</span>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
          loading
            ? "bg-violet-900/60 text-violet-400 cursor-not-allowed"
            : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 active:scale-[0.98]"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-violet-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating your study guide…
          </>
        ) : (
          <>✨ Generate Study Guide</>
        )}
      </button>
    </div>
  );
}
