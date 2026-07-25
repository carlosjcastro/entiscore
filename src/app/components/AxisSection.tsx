"use client";

import { useState } from "react";
import { HiChevronDown, HiClock, HiExclamationCircle } from "react-icons/hi2";
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
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-700/50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        <HiClock className="h-3 w-3" />
        Pendiente
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/40 px-2.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
        <HiExclamationCircle className="h-3 w-3" />
        Error
      </span>
    );
  }

  const scoreColorClass =
    score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 60
        ? "text-emerald-600 dark:text-emerald-400"
        : score >= 40
          ? "text-amber-600 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";

  return (
    <span className={`text-sm font-semibold tabular-nums ${scoreColorClass}`}>
      {score}
    </span>
  );
}

export function AxisSection({ axisName, result }: AxisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(result.status === "evaluated");

  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left bg-white dark:bg-zinc-800/30 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60"
      >
        <span className="text-[13px] sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {AXIS_DISPLAY_NAMES[axisName]}
        </span>
        <div className="flex items-center gap-3">
          <AxisScoreBadge score={result.score} status={result.status} />
          <HiChevronDown
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-250 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-100 dark:border-zinc-700/50 px-4 py-3 sm:px-5 sm:py-4">
            {result.status === "partial" ? (
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 italic">
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
        </div>
      </div>
    </div>
  );
}
