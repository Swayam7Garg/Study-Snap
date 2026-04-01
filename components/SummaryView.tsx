"use client";

// Pure-JS summary renderer — no extra deps required.
// Handles bullet points, headings (# / ## / **Bold**), and plain paragraphs.

function parseSummary(text: string): React.ReactNode[] {
  const sections = text.split(/\n\n+/);
  const nodes: React.ReactNode[] = [];

  sections.forEach((section, si) => {
    const lines = section.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) return;

    // Heading lines: starts with ## or # or ALL CAPS short line
    if (lines.length === 1) {
      const line = lines[0].trim();
      // Markdown heading
      const h2 = line.match(/^##\s*(.*)/);
      const h1 = line.match(/^#\s*(.*)/);
      if (h1 || h2) {
        nodes.push(
          <h3 key={si} className="text-lg font-bold text-violet-400 border-b border-violet-900/40 pb-1.5 mt-2">
            {(h1 || h2)![1]}
          </h3>
        );
        return;
      }
      // Bold-like standalone line
      const bold = line.match(/^\*\*(.*)\*\*$/);
      if (bold) {
        nodes.push(
          <h3 key={si} className="text-base font-bold text-violet-300 mt-2">
            {bold[1]}
          </h3>
        );
        return;
      }
    }

    // Bullet group — all lines start with -, *, •
    const isBulletGroup = lines.every((l) => /^[-*•]\s/.test(l.trim()));
    if (isBulletGroup) {
      nodes.push(
        <ul key={si} className="space-y-2.5 my-1">
          {lines.map((line, li) => {
            const content = line.replace(/^[-*•]\s*/, "").trim();
            return (
              <li key={li} className="flex items-start gap-2.5 text-slate-300 leading-relaxed text-[15px]">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: inlineBold(content) }} />
              </li>
            );
          })}
        </ul>
      );
      return;
    }

    // Mixed or plain paragraph
    nodes.push(
      <div key={si} className="space-y-2">
        {lines.map((line, li) => {
          const trimmed = line.trim();
          // Single bullet
          if (/^[-*•]\s/.test(trimmed)) {
            const content = trimmed.replace(/^[-*•]\s*/, "");
            return (
              <div key={li} className="flex items-start gap-2.5 text-slate-300 leading-relaxed text-[15px]">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: inlineBold(content) }} />
              </div>
            );
          }
          // Heading line within block
          const h = trimmed.match(/^#+\s*(.*)/);
          if (h) {
            return (
              <p key={li} className="font-semibold text-violet-400 text-[15px]">{h[1]}</p>
            );
          }
          // Plain text
          return (
            <p
              key={li}
              className="text-slate-300 leading-relaxed text-[15px]"
              dangerouslySetInnerHTML={{ __html: inlineBold(trimmed) }}
            />
          );
        })}
      </div>
    );
  });

  return nodes;
}

/** Convert **bold** and *italic* inline markdown to HTML */
function inlineBold(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>');
}

export default function SummaryView({ summary }: { summary: string }) {
  const nodes = parseSummary(summary);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">{nodes}</div>
    </div>
  );
}
