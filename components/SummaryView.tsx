export default function SummaryView({ summary }: { summary: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
        <h3 className="text-xl font-bold text-violet-400 mb-4 flex items-center gap-2">
          📑 Key Takeaways
        </h3>
        <p className="text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    </div>
  );
}
