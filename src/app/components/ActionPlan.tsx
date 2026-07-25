import { HiLightBulb } from "react-icons/hi2";
import type { ActionItem, EffortLevel } from "@/types";

interface ActionPlanProps {
  items: ActionItem[];
}

const EFFORT_BADGE_CONFIG: Record<EffortLevel, string> = {
  bajo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  medio: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  alto: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

function EffortBadge({ effort }: { effort: EffortLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide ${EFFORT_BADGE_CONFIG[effort]}`}
    >
      {effort}
    </span>
  );
}

export function ActionPlan({ items }: ActionPlanProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <HiLightBulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Plan de acci\u00f3n
        </h3>
      </div>
      <ol className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.priority}
            className="flex gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-3.5 sm:p-4 transition-shadow hover:shadow-sm"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-[11px] font-bold text-white dark:text-zinc-900">
              {item.priority}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {item.title}
                </p>
                <EffortBadge effort={item.effort} />
              </div>
              <p className="mt-1.5 text-[12px] sm:text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.reason}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
