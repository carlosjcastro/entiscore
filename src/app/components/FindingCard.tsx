"use client";

import { useState } from "react";
import { HiCheckCircle, HiExclamationTriangle, HiXCircle, HiChevronDown } from "react-icons/hi2";
import type { Finding } from "@/types";

interface FindingCardProps {
  finding: Finding;
}

const FINDING_TYPE_CONFIG: Record<
  Finding["type"],
  { icon: typeof HiCheckCircle; containerClass: string; iconClass: string }
> = {
  positive: {
    icon: HiCheckCircle,
    containerClass: "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-800/30 dark:bg-emerald-950/20",
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  warning: {
    icon: HiExclamationTriangle,
    containerClass: "border-amber-200/60 bg-amber-50/40 dark:border-amber-800/30 dark:bg-amber-950/20",
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  critical: {
    icon: HiXCircle,
    containerClass: "border-rose-200/60 bg-rose-50/40 dark:border-rose-800/30 dark:bg-rose-950/20",
    iconClass: "text-rose-500 dark:text-rose-400",
  },
};

export function FindingCard({ finding }: FindingCardProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const config = FINDING_TYPE_CONFIG[finding.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-3 transition-colors ${config.containerClass}`}>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
            {finding.title}
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            {finding.description}
          </p>
          {finding.details && (
            <>
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <HiChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${isDetailsExpanded ? "rotate-180" : ""}`}
                />
                {isDetailsExpanded ? "Ocultar" : "Detalle"}
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${isDetailsExpanded ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/50 rounded p-2 leading-relaxed">
                    {finding.details}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
