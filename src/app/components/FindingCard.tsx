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
    containerClass: "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  warning: {
    icon: HiExclamationTriangle,
    containerClass: "border-amber-100 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30",
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  critical: {
    icon: HiXCircle,
    containerClass: "border-rose-100 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/30",
    iconClass: "text-rose-500 dark:text-rose-400",
  },
};

export function FindingCard({ finding }: FindingCardProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const config = FINDING_TYPE_CONFIG[finding.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-3 sm:p-4 transition-colors ${config.containerClass}`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
            {finding.title}
          </p>
          <p className="mt-1 text-[12px] sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            {finding.description}
          </p>
          {finding.details && (
            <>
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <HiChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${isDetailsExpanded ? "rotate-180" : ""}`}
                />
                {isDetailsExpanded ? "Ocultar detalle" : "Ver detalle"}
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${isDetailsExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 bg-white/60 dark:bg-zinc-800/60 rounded-md p-2.5 leading-relaxed">
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
