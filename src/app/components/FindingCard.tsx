"use client";

import { useState } from "react";
import type { Finding } from "@/types";

interface FindingCardProps {
  finding: Finding;
}

const FINDING_TYPE_STYLES: Record<
  Finding["type"],
  { border: string; icon: string; iconColor: string }
> = {
  positive: {
    border: "border-green-200 dark:border-green-800",
    icon: "\u2713",
    iconColor: "text-green-600 dark:text-green-400",
  },
  warning: {
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "\u26A0",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  critical: {
    border: "border-red-200 dark:border-red-800",
    icon: "\u2717",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function FindingCard({ finding }: FindingCardProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const styles = FINDING_TYPE_STYLES[finding.type];

  return (
    <div className={`rounded-lg border p-3 ${styles.border}`}>
      <div className="flex items-start gap-2">
        <span className={`text-lg leading-none ${styles.iconColor}`}>
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {finding.title}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {finding.description}
          </p>
          {finding.details && (
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              {isDetailsExpanded ? "Ocultar detalle" : "Ver detalle"}
            </button>
          )}
          {isDetailsExpanded && finding.details && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded p-2">
              {finding.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
