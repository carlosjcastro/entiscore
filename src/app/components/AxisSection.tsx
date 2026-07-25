"use client";

import { useState } from "react";
import type { AxisResult, AxisName } from "@/types";
import { FindingCard } from "./FindingCard";

interface AxisSectionProps {
  axisName: AxisName;
  result: AxisResult;
}

const AXIS_DISPLAY_NAMES: Record<AxisName, string> = {
  structuredData: "Datos estructurados",
  identityConsistency: "Consistencia de identidad",
  authoritySignals: "Se\u00f1ales de autoridad",
  technicalAccessibility: "Accesibilidad t\u00e9cnica",
};

function AxisScoreBadge({ score, status }: { score: number; status: AxisResult["status"] }) {
  if (status === "partial") {
    return (
      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Pendiente
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        Error
      </span>
    );
  }

  return (
    <span className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
      {score}/100
    </span>
  );
}

export function AxisSection({ axisName, result }: AxisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(result.status === "evaluated");

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {AXIS_DISPLAY_NAMES[axisName]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AxisScoreBadge score={result.score} status={result.status} />
          <span className="text-zinc-400 text-xs">
            {isExpanded ? "\u25B2" : "\u25BC"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-3">
          {result.status === "partial" ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
              Este eje se evaluar\u00e1 en una fase posterior del desarrollo.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {result.findings.map((finding, index) => (
                <FindingCard key={index} finding={finding} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
