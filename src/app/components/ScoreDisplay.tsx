import type { MaturityLevel } from "@/types";

interface ScoreDisplayProps {
  overallScore: number;
  maturityLevel: MaturityLevel;
}

const MATURITY_LEVEL_STYLES: Record<
  MaturityLevel,
  { bg: string; text: string; ring: string; label: string }
> = {
  bajo: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-red-200 dark:ring-red-800",
    label: "Bajo",
  },
  medio: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    ring: "ring-yellow-200 dark:ring-yellow-800",
    label: "Medio",
  },
  alto: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    label: "Alto",
  },
  excelente: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    ring: "ring-green-200 dark:ring-green-800",
    label: "Excelente",
  },
};

export function ScoreDisplay({ overallScore, maturityLevel }: ScoreDisplayProps) {
  const styles = MATURITY_LEVEL_STYLES[maturityLevel];

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl p-6 ring-1 ${styles.bg} ${styles.ring}`}
    >
      <span className={`text-5xl font-bold tabular-nums ${styles.text}`}>
        {overallScore}
      </span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">de 100</span>
      <span
        className={`mt-1 rounded-full px-3 py-1 text-sm font-medium ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}
      >
        {styles.label}
      </span>
    </div>
  );
}
