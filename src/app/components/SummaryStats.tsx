import { HiCheckCircle, HiExclamationTriangle, HiXCircle } from "react-icons/hi2";
import type { AuditResponse, Finding } from "@/types";
import { useI18n } from "@/i18n";

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
  const t = useI18n();

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <HiCheckCircle className="h-4 w-4 text-emerald-500" />
        <span className="text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
          {counts.positive}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.report.positive}</span>
      </div>
      <div className="flex items-center gap-2">
        <HiExclamationTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
          {counts.warning}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.report.warnings}</span>
      </div>
      <div className="flex items-center gap-2">
        <HiXCircle className="h-4 w-4 text-rose-500" />
        <span className="text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
          {counts.critical}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.report.critical}</span>
      </div>
    </div>
  );
}
