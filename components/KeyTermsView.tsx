"use client";

import { KeyTerm } from "@/app/page";

export default function KeyTermsView({ keyTerms }: { keyTerms: KeyTerm[] }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden animate-in fade-in duration-500 shadow-sm">
      <div className="p-5 border-b border-slate-700 bg-slate-800/80">
        <h3 className="text-xl font-bold text-slate-200">📖 Key Terms & Definitions</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="py-3 px-5 text-sm font-semibold text-slate-400 w-1/4">Term</th>
              <th className="py-3 px-5 text-sm font-semibold text-slate-400 w-3/4">Definition</th>
            </tr>
          </thead>
          <tbody>
            {keyTerms.map((kt, i) => (
              <tr 
                key={i} 
                className={`border-b border-slate-700/50 last:border-0 ${
                  i % 2 === 0 ? "bg-slate-800" : "bg-slate-800/60"
                }`}
              >
                <td className="py-4 px-5 text-violet-400 font-semibold align-top">{kt.term}</td>
                <td className="py-4 px-5 text-slate-300 text-[15px] leading-relaxed">{kt.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
