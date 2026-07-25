import type { MaturityLevel } from "@/types";

interface ScoreDisplayProps {
  overallScore: number;
  maturityLevel: MaturityLevel;
}

const MATURITY_LEVEL_CONFIG: Record<
  MaturityLevel,
  { strokeColor: string; textColor: string; badgeClass: string; label: string }
> = {
  bajo: {
    strokeColor: "stroke-rose-500",
    textColor: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    label: "Bajo",
  },
  medio: {
    strokeColor: "stroke-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    label: "Medio",
  },
  alto: {
    strokeColor: "stroke-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    label: "Alto",
  },
  excelente: {
    strokeColor: "stroke-green-500",
    textColor: "text-green-600 dark:text-green-400",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",
    label: "Excelente",
  },
};

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function ScoreDisplay({ overallScore, maturityLevel }: ScoreDisplayProps) {
  const config = MATURITY_LEVEL_CONFIG[maturityLevel];
  const progressOffset = CIRCLE_CIRCUMFERENCE - (overallScore / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36 sm:h-44 sm:w-44">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth="8"
            className="stroke-zinc-200 dark:stroke-zinc-700"
          />
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={progressOffset}
            className={`${config.strokeColor} transition-[stroke-dashoffset] duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${config.textColor}`}>
            {overallScore}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            de 100
          </span>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
        {config.label}
      </span>
    </div>
  );
}
