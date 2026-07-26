"use client";

import { useState } from "react";
import { HiLightBulb, HiCodeBracket, HiCheck } from "react-icons/hi2";
import type { ActionItem, AxisName, EffortLevel } from "@/types";
import { AXIS_CONFIG } from "./AxisSection";

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
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${EFFORT_BADGE_CONFIG[effort]}`}
    >
      {effort}
    </span>
  );
}

function CodeSnippetBlock({ code, language }: { code: string; language: string }) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="mt-2 relative">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 dark:bg-zinc-950 rounded-t border border-zinc-700 border-b-0">
        <span className="text-[10px] font-medium text-zinc-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          {isCopied ? <HiCheck className="h-3 w-3 text-emerald-400" /> : <HiCodeBracket className="h-3 w-3" />}
          {isCopied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 bg-zinc-900 dark:bg-zinc-950 rounded-b border border-zinc-700 border-t-0 text-[11px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ActionItemRow({ item }: { item: ActionItem }) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  return (
    <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 transition-all duration-200 hover:translate-x-1 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 rounded-r">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-zinc-300 dark:text-zinc-600 tabular-nums">
          {item.priority}
        </span>
        <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
          {item.title}
        </p>
        <EffortBadge effort={item.effort} />
        {item.codeSnippet && (
          <button
            onClick={() => setIsCodeExpanded(!isCodeExpanded)}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-wide"
          >
            <HiCodeBracket className="h-3 w-3" />
            {isCodeExpanded ? "ocultar" : "ver código"}
          </button>
        )}
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400 pl-5">
        {item.reason}
      </p>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isCodeExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {item.codeSnippet && (
            <div className="pl-5">
              <CodeSnippetBlock code={item.codeSnippet} language={item.codeLanguage ?? "html"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function groupItemsByAxis(items: ActionItem[]): Map<AxisName, ActionItem[]> {
  const grouped = new Map<AxisName, ActionItem[]>();
  for (const item of items) {
    const existing = grouped.get(item.axis) ?? [];
    existing.push(item);
    grouped.set(item.axis, existing);
  }
  return grouped;
}

export function ActionPlan({ items }: ActionPlanProps) {
  const groupedItems = groupItemsByAxis(items);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <HiLightBulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          Plan de acción
        </h3>
      </div>
      <div className="flex flex-col gap-6">
        {Array.from(groupedItems.entries()).map(([axisName, axisItems]) => {
          const axisConfig = AXIS_CONFIG[axisName];
          const Icon = axisConfig.icon;
          return (
            <div key={axisName} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${axisConfig.accentColor}`} />
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {axisConfig.label}
                </span>
              </div>
              <div className="flex flex-col gap-0 pl-6 border-l border-zinc-200 dark:border-zinc-700">
                {axisItems.map((item) => (
                  <ActionItemRow key={item.priority} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
