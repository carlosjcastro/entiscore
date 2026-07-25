import type { MaturityLevel } from "@/types";

interface ScoreDisplayProps {
  overallScore: number;
  maturityLevel: MaturityLevel;
}

const MATURITY_LEVEL_CONFIG: Record<
  MaturityLevel,
  { scoreClass: string; badgeClass: string; ringClass: string; label: string }
> = {
  bajo: {
    scoreClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    ringClass: "ring-rose-200/60 dark:ring-rose-800/40",
    label: "Bajo",
  },
  medio: {
    scoreClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    ringClass: "ring-amber-200/60 dark:ring-amber-800/40",
    label: "Medio",
  },
  alto: {
    scoreClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    ringClass: "ring-emerald-200/60 dark:ring-emerald-800/40",
    label: "Alto",
  },
  excelente: {
    scoreClass: "text-green-600 dark:text-green-400",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",
    ringClass: "ring-green-200/60 dark:ring-green-800/40",
    label: "Excelente",
  },
};

export function ScoreDisplay({ overallScore, maturityLevel }: ScoreDisplayProps) {
  const config = MATURITY_LEVEL_CONFIG[maturityLevel];

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl bg-white dark:bg-zinc-800/50 p-8 ring-1 shadow-sm ${config.ringClass}`}
    >
      <span className={`text-6xl sm:text-7xl font-extrabold tabular-nums tracking-tight ${config.scoreClass}`}>
        {overallScore}
      </span>
      <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        de 100
      </span>
      <span
        className={`mt-3 rounded-full px-3.5 py-1 text-xs font-semibold ${config.badgeClass}`}
      >
        {config.label}
      </span>
    </div>
  );
}
