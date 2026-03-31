"use client";

import { ChangeEvent, useRef } from "react";

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

export default function InputPanel({
  inputText, setInputText, difficulty, setDifficulty, 
  questionCount, setQuestionCount, onGenerate, loading, error
}: InputPanelProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setInputText(ev.target.result as string);
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        
        // Setup worker dynamically
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
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700/50">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your lecture notes, chapter excerpt, or any study text here..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 min-h-[240px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        />
        
        <div className="flex justify-between items-center mt-2 mb-6">
          <span className="text-sm text-slate-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          
          <div>
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
              className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition text-slate-200 flex items-center gap-2"
            >
              📄 Upload File
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty Level</label>
            <div className="flex gap-3">
              {(["Easy", "Medium", "Hard"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                    difficulty === level 
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" 
                      : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
             <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Questions: {questionCount}</label>
             </div>
             <input 
               type="range"
               min={3}
               max={10}
               value={questionCount}
               onChange={(e) => setQuestionCount(Number(e.target.value))}
               className="w-full accent-violet-500 hover:accent-violet-400 cursor-pointer"
             />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
              🚨 {error}
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              loading 
                ? "bg-violet-800 text-violet-300 cursor-not-allowed" 
                : "bg-violet-600 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/40 text-white active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Generating...
              </>
            ) : "✨ Generate Study Notes"}
          </button>
        </div>
      </div>
  );
}
