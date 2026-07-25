import type { ActionItem, EffortLevel } from "@/types";

interface ActionPlanProps {
  items: ActionItem[];
}

const EFFORT_BADGE_STYLES: Record<EffortLevel, string> = {
  bajo: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medio: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  alto: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function EffortBadge({ effort }: { effort: EffortLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EFFORT_BADGE_STYLES[effort]}`}
    >
      Esfuerzo {effort}
    </span>
  );
}

export function ActionPlan({ items }: ActionPlanProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Plan de acci\u00f3n
      </h3>
      <ol className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.priority}
            className="flex gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {item.priority}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                <EffortBadge effort={item.effort} />
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {item.reason}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
