import { HiCheckCircle, HiExclamationTriangle, HiXCircle } from "react-icons/hi2";
import type { AuditResponse, Finding } from "@/types";

interface SummaryStatsProps {
  data: AuditResponse;
}

function countFindingsByType(data: AuditResponse): { positive: number; warning: number; critical: number } {
  const allFindings: Finding[] = Object.values(data.axes).flatMap((axis) => axis.findings);

  return {
    positive: allFindings.filter((f) => f.type === "positive").length,
    warning: allFindings.filter((f) => f.type === "warning").length,
    critical: allFindings.filter((f) => f.type === "critical").length,
  };
}

export function SummaryStats({ data }: SummaryStatsProps) {
  const counts = countFindingsByType(data);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 p-3">
        <HiCheckCircle className="h-5 w-5 text-emerald-500" />
        <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
          {counts.positive}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">
          Positivos
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 p-3">
        <HiExclamationTriangle className="h-5 w-5 text-amber-500" />
        <span className="text-xl font-bold tabular-nums text-amber-700 dark:text-amber-300">
          {counts.warning}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">
          Mejorables
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/30 p-3">
        <HiXCircle className="h-5 w-5 text-rose-500" />
        <span className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
          {counts.critical}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-rose-600/70 dark:text-rose-400/70">
          Críticos
        </span>
      </div>
    </div>
  );
}
