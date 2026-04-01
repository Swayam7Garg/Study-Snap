"use client";

import { useState, useEffect, useCallback } from "react";
import { QuizItem } from "@/app/page";

// Mini confetti burst that fires when user beats the quiz
function useConfetti(trigger: boolean) {
  useEffect(() => {
    if (!trigger) return;
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; alpha: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 2) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2,
        alpha: 1,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.alpha -= 0.015;
        if (p.alpha <= 0) return;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      if (particles.some((p) => p.alpha > 0)) {
        frame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);
}

export default function QuizView({ quiz }: { quiz: QuizItem[] }) {
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const answered = Object.keys(selections).length;
  const correctCount = Object.entries(selections).filter(([qIdx, selectedOptIdx]) => {
    const q = quiz[Number(qIdx)];
    return q?.options[selectedOptIdx] === q?.answer;
  }).length;

  const allAnswered = answered === quiz.length;
  const perfect = correctCount === quiz.length;
  useConfetti(showResult && perfect);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (questionIndex in selections) return;
    setSelections((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleReset = () => {
    setSelections({});
    setShowResult(false);
  };

  const scorePercent = quiz.length > 0 ? Math.round((correctCount / quiz.length) * 100) : 0;

  const getScoreColor = () => {
    if (scorePercent >= 80) return "text-emerald-400";
    if (scorePercent >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = () => {
    if (scorePercent >= 80) return "from-emerald-900/40 to-teal-900/30 border-emerald-500/40";
    if (scorePercent >= 50) return "from-amber-900/40 to-yellow-900/30 border-amber-500/40";
    return "from-rose-900/40 to-red-900/30 border-rose-500/40";
  };

  const getScoreEmoji = () => {
    if (scorePercent === 100) return "🏆";
    if (scorePercent >= 80) return "🎉";
    if (scorePercent >= 60) return "💪";
    if (scorePercent >= 40) return "📚";
    return "🔄";
  };

  const getScoreMessage = () => {
    if (scorePercent === 100) return "Perfect Score! You've mastered this!";
    if (scorePercent >= 80) return "Excellent work! Almost there!";
    if (scorePercent >= 60) return "Good job! Keep practicing!";
    if (scorePercent >= 40) return "Keep going! Review the material.";
    return "Don't give up! Review and try again.";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-500"
            style={{ width: `${(answered / quiz.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-slate-400 whitespace-nowrap">
          {answered} / {quiz.length}
        </span>
        {answered > 0 && (
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition active:scale-95 whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </div>

      {/* Score reveal button */}
      {allAnswered && !showResult && (
        <button
          onClick={() => setShowResult(true)}
          className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition active:scale-[0.98] animate-in fade-in zoom-in-95 duration-300"
        >
          ✨ Reveal My Score!
        </button>
      )}

      {/* Score card with canvas for confetti */}
      {showResult && (
        <div
          className={`relative overflow-hidden rounded-2xl p-6 border bg-gradient-to-br ${getScoreColor()} text-center animate-in fade-in zoom-in-90 duration-500 ${getScoreBg()}`}
        >
          <canvas
            id="confetti-canvas"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div className="relative z-10">
            <div className="text-5xl mb-3">{getScoreEmoji()}</div>
            <div className={`text-5xl font-black mb-1 ${getScoreColor()}`}>{scorePercent}%</div>
            <div className="text-slate-300 font-medium text-lg">
              {correctCount} / {quiz.length} Correct
            </div>
            <p className={`mt-2 text-sm font-semibold ${getScoreColor()}`}>{getScoreMessage()}</p>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {quiz.map((q, qIdx) => {
          const isAnswered = qIdx in selections;
          const chosenIdx = selections[qIdx];

          return (
            <div
              key={qIdx}
              className={`rounded-xl p-5 border transition-all duration-300 ${
                isAnswered
                  ? "bg-slate-800/70 border-slate-700/50"
                  : "bg-slate-800 border-slate-700/50 hover:border-violet-700/40"
              }`}
            >
              <h4 className="text-base font-semibold text-slate-200 mb-4 leading-snug">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-900/60 text-violet-300 text-sm font-bold mr-2.5">
                  {qIdx + 1}
                </span>
                {q.question}
              </h4>

              <div className="flex flex-col gap-2.5">
                {q.options.map((option, optIdx) => {
                  let cls =
                    "text-left p-3.5 rounded-lg border text-sm transition-all duration-200 w-full";
                  let indicator = "";

                  if (!isAnswered) {
                    cls += " bg-slate-900 text-slate-300 border-slate-700 hover:border-violet-500 hover:bg-violet-950/30 active:scale-[0.99] cursor-pointer";
                  } else {
                    const isCorrect = option === q.answer;
                    const isSelected = optIdx === chosenIdx;
                    if (isCorrect) {
                      cls += " bg-emerald-950/50 border-emerald-500 text-emerald-100";
                      indicator = "✓";
                    } else if (isSelected) {
                      cls += " bg-rose-950/50 border-rose-500 text-rose-200";
                      indicator = "✗";
                    } else {
                      cls += " bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                    }
                  }

                  const optLabels = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={isAnswered}
                      className={cls}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center ${
                            !isAnswered
                              ? "bg-slate-700 text-slate-400"
                              : option === q.answer
                              ? "bg-emerald-600 text-white"
                              : optIdx === chosenIdx
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-600"
                          }`}
                        >
                          {indicator || optLabels[optIdx]}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && q.explanation && (
                <div className="mt-4 p-3.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-400 text-[13px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="font-semibold text-violet-400">💡 Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
