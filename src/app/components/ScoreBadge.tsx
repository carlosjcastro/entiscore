"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { HiArrowDownTray, HiCodeBracket, HiCheck } from "react-icons/hi2";
import type { AuditResponse, MaturityLevel } from "@/types";

interface ScoreBadgeProps {
  report: AuditResponse;
}

const MATURITY_BADGE_COLORS: Record<MaturityLevel, { bg: string; text: string; border: string }> = {
  bajo: { bg: "#fef2f2", text: "#be123c", border: "#fecdd3" },
  medio: { bg: "#fffbeb", text: "#b45309", border: "#fed7aa" },
  alto: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  excelente: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatBadgeDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function generateMarkdownSnippet(report: AuditResponse): string {
  const domain = extractDomain(report.url);
  return `![Entiscore: ${report.overallScore}/100 (${report.maturityLevel})](entiscore-${domain}-${report.overallScore}.png)`;
}

function BadgeVisual({ report }: { report: AuditResponse }) {
  const colors = MATURITY_BADGE_COLORS[report.maturityLevel];
  const domain = extractDomain(report.url);
  const dateFormatted = formatBadgeDate(report.timestamp);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px",
        borderRadius: "10px",
        border: `1.5px solid ${colors.border}`,
        backgroundColor: colors.bg,
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "fit-content",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: colors.text,
            lineHeight: "1",
          }}
        >
          {report.overallScore}
        </span>
        <span
          style={{
            fontSize: "9px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: colors.text,
            opacity: 0.8,
          }}
        >
          {report.maturityLevel}
        </span>
      </div>
      <div
        style={{
          width: "1px",
          height: "36px",
          backgroundColor: colors.border,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#6366f1",
            letterSpacing: "0.02em",
          }}
        >
          Entiscore
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#27272a",
          }}
        >
          {domain}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "#71717a",
          }}
        >
          {dateFormatted}
        </span>
      </div>
    </div>
  );
}

export function ScoreBadge({ report }: ScoreBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isMarkdownCopied, setIsMarkdownCopied] = useState(false);

  async function handleDownloadBadge() {
    if (!badgeRef.current) return;

    const dataUrl = await toPng(badgeRef.current, { pixelRatio: 3 });
    const domain = extractDomain(report.url);
    const link = document.createElement("a");
    link.download = `entiscore-${domain}-${report.overallScore}.png`;
    link.href = dataUrl;
    link.click();
  }

  function handleCopyMarkdown() {
    const snippet = generateMarkdownSnippet(report);
    navigator.clipboard.writeText(snippet);
    setIsMarkdownCopied(true);
    setTimeout(() => setIsMarkdownCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={badgeRef} className="inline-block">
        <BadgeVisual report={report} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadBadge}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm active:scale-[0.98]"
        >
          <HiArrowDownTray className="h-3.5 w-3.5" />
          Descargar insignia
        </button>
        <button
          onClick={handleCopyMarkdown}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm active:scale-[0.98]"
        >
          {isMarkdownCopied ? (
            <>
              <HiCheck className="h-3.5 w-3.5 text-emerald-500" />
              Copiado
            </>
          ) : (
            <>
              <HiCodeBracket className="h-3.5 w-3.5" />
              Copiar Markdown
            </>
          )}
        </button>
      </div>
    </div>
  );
}
