"use client";

import { useState } from "react";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    
    // Custom plain toast style to avoid needing an external library just for this UI logic
    const toast = document.createElement("div");
    toast.className = "fixed bottom-5 right-5 bg-violet-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-violet-500 z-50 animate-bounce font-medium text-sm flex items-center gap-2";
    toast.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating PDF...
    `;
    document.body.appendChild(toast);

    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("pdf-export");
      if (!element) throw new Error("Export container not found");
      
      const opt = {
        margin:       0.5,
        filename:     'StudySnap_Notes.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Uh oh! Failed to generate PDF.");
    } finally {
      document.body.removeChild(toast);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium text-sm border shadow-sm transition flex items-center gap-2 ${
        loading 
          ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed" 
          : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500 active:scale-95"
      }`}
    >
      {loading ? (
        <>
           <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Preparing...
        </>
      ) : (
        <>⬇ Download PDF</>
      )}
    </button>
  );
}
