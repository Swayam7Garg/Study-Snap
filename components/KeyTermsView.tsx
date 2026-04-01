"use client";

import { useState } from "react";
import { KeyTerm } from "@/app/page";

export default function KeyTermsView({ keyTerms }: { keyTerms: KeyTerm[] }) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const filtered = keyTerms.filter(
    (kt) =>
      kt.term.toLowerCase().includes(search.toLowerCase()) ||
      kt.definition.toLowerCase().includes(search.toLowerCase())
  );

  const copyTerm = (kt: KeyTerm, idx: number) => {
    navigator.clipboard.writeText(`${kt.term}: ${kt.definition}`);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          placeholder={`Search ${keyTerms.length} terms…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      {search && (
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {keyTerms.length} terms
        </p>
      )}

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No terms match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((kt, i) => (
            <div
              key={i}
              className="group relative p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-violet-700/50 transition-all duration-200 hover:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-violet-400 text-sm leading-snug">{kt.term}</h4>
                <button
                  onClick={() => copyTerm(kt, i)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-violet-400 text-xs px-2 py-0.5 rounded border border-slate-700 hover:border-violet-600"
                  title="Copy term + definition"
                >
                  {copied === i ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p className="text-slate-300 text-[13px] leading-relaxed">{kt.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
