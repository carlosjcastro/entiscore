"use client";

import { useState } from "react";
import { HiChevronDown, HiClock } from "react-icons/hi2";
import { HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt } from "react-icons/hi2";
import type { AxisResult, AxisName } from "@/types";
import { FindingCard } from "./FindingCard";
import { ScoreChange } from "./ScoreChange";
import { useI18n } from "@/i18n";

interface AxisSectionProps {
  axisName: AxisName;
  result: AxisResult;
  previousScore?: number;
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
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    borderAccent: "border-l-indigo-600 dark:border-l-indigo-400",
  },
  identityConsistency: {
    label: "Consistencia de identidad",
    icon: HiUser,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    borderAccent: "border-l-indigo-500 dark:border-l-indigo-500",
  },
  authoritySignals: {
    label: "Señales de autoridad",
    icon: HiShieldCheck,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    borderAccent: "border-l-indigo-400 dark:border-l-indigo-500",
  },
  technicalAccessibility: {
    label: "Accesibilidad técnica",
    icon: HiGlobeAlt,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    borderAccent: "border-l-indigo-300 dark:border-l-indigo-600",
  },
};

function ScoreIndicator({ score, status, pendingLabel }: { score: number; status: AxisResult["status"]; pendingLabel: string }) {
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
        <HiClock className="h-3.5 w-3.5" />
        {pendingLabel}
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

export function AxisSection({ axisName, result, previousScore }: AxisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = AXIS_CONFIG[axisName];
  const Icon = config.icon;
  const t = useI18n();

  return (
    <div className={`border-l-[3px] ${config.borderAccent} pl-4 rounded-r-lg transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/5 hover:bg-white/50 dark:hover:bg-zinc-800/30`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${config.iconBgClass}`}>
          <Icon className={`h-3.5 w-3.5 ${config.accentColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {t.axis[axisName]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreIndicator score={result.score} status={result.status} pendingLabel={t.axis.pending} />
          {previousScore !== undefined && result.status === "evaluated" && (
            <ScoreChange currentScore={result.score} previousScore={previousScore} />
          )}
        </div>
        <HiChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-250 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-3">
            {result.status === "partial" ? (
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 italic py-2">
                {t.axis.pendingMessage}
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
