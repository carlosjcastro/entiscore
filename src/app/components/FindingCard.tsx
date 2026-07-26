"use client";

import { useState } from "react";
import { HiCheckCircle, HiExclamationTriangle, HiXCircle, HiChevronDown } from "react-icons/hi2";
import type { Finding } from "@/types";

interface FindingCardProps {
  finding: Finding;
}

const FINDING_TYPE_CONFIG: Record<
  Finding["type"],
  { icon: typeof HiCheckCircle; iconClass: string }
> = {
  positive: {
    icon: HiCheckCircle,
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  warning: {
    icon: HiExclamationTriangle,
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  critical: {
    icon: HiXCircle,
    iconClass: "text-rose-500 dark:text-rose-400",
  },
};

export function FindingCard({ finding }: FindingCardProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const config = FINDING_TYPE_CONFIG[finding.type];
  const Icon = config.icon;

  return (
    <div className="py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
            {finding.title}
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {finding.description}
          </p>
          {finding.details && (
            <>
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6 leading-relaxed">
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
