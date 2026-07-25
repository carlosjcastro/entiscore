"use client";

import { useState } from "react";
import { HiChevronDown, HiClock } from "react-icons/hi2";
import { HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt } from "react-icons/hi2";
import type { AxisResult, AxisName } from "@/types";
import { FindingCard } from "./FindingCard";

interface AxisSectionProps {
  axisName: AxisName;
  result: AxisResult;
}

interface AxisConfig {
  label: string;
  icon: typeof HiCodeBracketSquare;
  accentColor: string;
  iconBgClass: string;
  borderAccent: string;
}

const AXIS_CONFIG: Record<AxisName, AxisConfig> = {
  structuredData: {
    label: "Datos estructurados",
    icon: HiCodeBracketSquare,
    accentColor: "text-violet-600 dark:text-violet-400",
    iconBgClass: "bg-violet-100 dark:bg-violet-900/40",
    borderAccent: "border-l-violet-500",
  },
  identityConsistency: {
    label: "Consistencia de identidad",
    icon: HiUser,
    accentColor: "text-sky-600 dark:text-sky-400",
    iconBgClass: "bg-sky-100 dark:bg-sky-900/40",
    borderAccent: "border-l-sky-500",
  },
  authoritySignals: {
    label: "Señales de autoridad",
    icon: HiShieldCheck,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-100 dark:bg-indigo-900/40",
    borderAccent: "border-l-indigo-500",
  },
  technicalAccessibility: {
    label: "Accesibilidad técnica",
    icon: HiGlobeAlt,
    accentColor: "text-teal-600 dark:text-teal-400",
    iconBgClass: "bg-teal-100 dark:bg-teal-900/40",
    borderAccent: "border-l-teal-500",
  },
};

function ScoreIndicator({ score, status }: { score: number; status: AxisResult["status"] }) {
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
        <HiClock className="h-3.5 w-3.5" />
        Pendiente
      </span>
    );
  }

  const colorClass =
    score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  return (
    <span className={`text-lg font-bold tabular-nums ${colorClass}`}>
      {score}
    </span>
  );
}

export function AxisSection({ axisName, result }: AxisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = AXIS_CONFIG[axisName];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-700/60 border-l-4 ${config.borderAccent} bg-white dark:bg-zinc-800/20 overflow-hidden transition-shadow hover:shadow-sm`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconBgClass}`}>
          <Icon className={`h-4 w-4 ${config.accentColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {config.label}
          </span>
        </div>
        <ScoreIndicator score={result.score} status={result.status} />
        <HiChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-250 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-100 dark:border-zinc-700/40 px-4 py-3 space-y-2">
            {result.status === "partial" ? (
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 italic py-2">
                Este eje se evaluará en una fase posterior del desarrollo.
              </p>
            ) : (
              result.findings.map((finding, index) => (
                <FindingCard key={index} finding={finding} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AXIS_CONFIG };
