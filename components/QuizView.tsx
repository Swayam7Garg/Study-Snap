"use client";

import { useState } from "react";
import { QuizItem } from "@/app/page";

export default function QuizView({ quiz }: { quiz: QuizItem[] }) {
  // Map of questionIndex to chosenOptionIndex
  const [selections, setSelections] = useState<Record<number, number>>({});

  const correctCount = Object.entries(selections).filter(
    ([qIdx, selectedOptIdx]) => {
      const q = quiz[Number(qIdx)];
      return q?.options[selectedOptIdx] === q?.answer;
    }
  ).length;

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (questionIndex in selections) return; // already answered
    setSelections(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleReset = () => setSelections({});

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700 shadow-sm">
        <h3 className="text-lg font-medium text-slate-200">
          ✅ {correctCount} / {quiz.length} Correct
        </h3>
        {Object.keys(selections).length > 0 && (
           <button 
             onClick={handleReset}
             className="text-sm px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition active:scale-95"
           >
             Reset Quiz
           </button>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((q, qIdx) => {
          const isAnswered = qIdx in selections;
          const chosenIdx = selections[qIdx];
          
          return (
            <div key={qIdx} className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">
                <span className="text-violet-500 mr-2">{qIdx + 1}.</span> 
                {q.question}
              </h4>
              
              <div className="flex flex-col gap-3">
                {q.options.map((option, optIdx) => {
                  let buttonClass = "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500";
                  let icon = "";
                  
                  if (isAnswered) {
                    const isCorrect = option === q.answer;
                    const isSelected = optIdx === chosenIdx;
                    
                    if (isCorrect) {
                      buttonClass = "bg-emerald-900/40 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500";
                      icon = "✓ ";
                    } else if (isSelected) {
                      buttonClass = "bg-rose-900/40 border-rose-500 text-rose-100";
                      icon = "✗ ";
                    } else {
                      buttonClass = "bg-slate-900/50 text-slate-500 border-slate-800 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={isAnswered}
                      className={`text-left p-4 rounded-lg border transition-all ${buttonClass} ${!isAnswered && 'hover:bg-slate-800 hover:shadow'}`}
                    >
                      {icon}{option}
                    </button>
                  );
                })}
              </div>

              {isAnswered && q.explanation && (
                <div className="mt-4 p-4 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 text-sm animate-in fade-in zoom-in-95 duration-300">
                  <span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
