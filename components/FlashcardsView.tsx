"use client";

import { useState, useCallback } from "react";
import { KeyTerm } from "@/app/page";

export default function FlashcardsView({ flashcards }: { flashcards: KeyTerm[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = flashcards.length;
  const masteredCount = mastered.size;
  const progress = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setDirection(dir === "next" ? "left" : "right");
      setFlipped(false);

      setTimeout(() => {
        setCurrentIndex((prev) =>
          dir === "next" ? (prev + 1) % total : (prev - 1 + total) % total
        );
        setDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating, total]
  );

  const toggleMastered = (idx: number) => {
    setMastered((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="text-6xl mb-4">🃏</div>
        <p>No flashcards available.</p>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const isMastered = mastered.has(currentIndex);

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>
            Card {currentIndex + 1} / {total}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{masteredCount}</span>
            <span>/ {total} Mastered</span>
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className={`flashcard-wrapper w-full max-w-xl cursor-pointer select-none transition-transform duration-300 ${
          direction === "left"
            ? "-translate-x-8 opacity-0"
            : direction === "right"
            ? "translate-x-8 opacity-0"
            : "translate-x-0 opacity-100"
        }`}
        style={{ perspective: "1200px", height: "300px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center border"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(15,23,42,0.9) 100%)",
              borderColor: isMastered ? "rgb(52,211,153)" : "rgba(109,40,217,0.5)",
              boxShadow: isMastered
                ? "0 0 40px rgba(52,211,153,0.15), 0 20px 60px rgba(0,0,0,0.4)"
                : "0 0 40px rgba(109,40,217,0.2), 0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4 opacity-70">
              Term
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">{card.term}</h2>
            <p className="text-slate-400 text-sm mt-6 flex items-center gap-1.5">
              <span className="animate-pulse">↔</span> Click to reveal definition
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center border"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(15,23,42,0.95) 100%)",
              borderColor: "rgba(52,211,153,0.5)",
              boxShadow: "0 0 40px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-4 opacity-70">
              Definition
            </div>
            <p className="text-xl text-slate-100 leading-relaxed">{card.definition}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full max-w-xl justify-between">
        <button
          onClick={() => navigate("prev")}
          disabled={isAnimating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50"
        >
          ← Prev
        </button>

        <button
          onClick={() => toggleMastered(currentIndex)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 border ${
            isMastered
              ? "bg-emerald-900/40 border-emerald-500 text-emerald-300 hover:bg-emerald-900/60"
              : "bg-slate-800 border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400"
          }`}
        >
          {isMastered ? "✓ Mastered!" : "Mark as Mastered"}
        </button>

        <button
          onClick={() => navigate("next")}
          disabled={isAnimating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i !== currentIndex && !isAnimating) {
                setIsAnimating(true);
                setFlipped(false);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsAnimating(false);
                }, 200);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "bg-violet-500 scale-125"
                : mastered.has(i)
                ? "bg-emerald-500 opacity-80"
                : "bg-slate-600 hover:bg-slate-500"
            }`}
            title={`Card ${i + 1}${mastered.has(i) ? " ✓" : ""}`}
          />
        ))}
      </div>

      {masteredCount === total && total > 0 && (
        <div className="w-full max-w-xl p-5 rounded-2xl text-center bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/50">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-emerald-300 font-bold text-lg">
            All cards mastered! You're ready for the quiz!
          </p>
        </div>
      )}
    </div>
  );
}
