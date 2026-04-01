"use client";

import { useState } from "react";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    // Inline toast
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-5 right-5 bg-violet-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-violet-500 z-[999] font-medium text-sm flex items-center gap-2.5 transition-all";
    toast.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Preparing your PDF…
    `;
    document.body.appendChild(toast);

    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("pdf-export");
      if (!element) throw new Error("Export container not found");

      const opt = {
        margin: [0.4, 0.5, 0.4, 0.5],
        filename: `StudySnap_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      } as const;

      await html2pdf().set(opt).from(element).save();

      toast.innerHTML = "✅ PDF Downloaded!";
      toast.className = toast.className.replace("bg-violet-600 border-violet-500", "bg-emerald-700 border-emerald-500");
      setTimeout(() => document.body.removeChild(toast), 1800);
    } catch (err) {
      console.error("PDF generation failed", err);
      toast.innerHTML = "❌ PDF failed — try again";
      toast.className = toast.className.replace("bg-violet-600 border-violet-500", "bg-rose-700 border-rose-500");
      setTimeout(() => document.body.removeChild(toast), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download study guide as PDF"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        loading
          ? "bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed"
          : "bg-slate-800/80 hover:bg-violet-900/40 border-slate-600 hover:border-violet-600 text-slate-300 hover:text-violet-300 active:scale-95 shadow-sm"
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Preparing…
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
}
