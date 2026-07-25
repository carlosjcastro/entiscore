"use client";

import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

interface ScoreChangeProps {
  currentScore: number;
  previousScore: number;
}

export function ScoreChange({ currentScore, previousScore }: ScoreChangeProps) {
  const difference = currentScore - previousScore;

  if (difference === 0) return null;

  const isImprovement = difference > 0;
  const absoluteDifference = Math.abs(difference);

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
        isImprovement
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-amber-600 dark:text-amber-400"
      }`}
    >
      {isImprovement ? (
        <HiArrowTrendingUp className="h-3 w-3" />
      ) : (
        <HiArrowTrendingDown className="h-3 w-3" />
      )}
      {isImprovement ? "+" : ""}{difference}
    </span>
  );
}
