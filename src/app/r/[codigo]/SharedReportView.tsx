"use client";

import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import type { AuditResponse, AxisName } from "@/types";
import { ScoreDisplay } from "@/app/components/ScoreDisplay";
import { SummaryStats } from "@/app/components/SummaryStats";
import { AxisSection } from "@/app/components/AxisSection";
import { ActionPlan } from "@/app/components/ActionPlan";
import { ThemeToggle } from "@/app/components/ThemeToggle";

interface SharedReportViewProps {
  report: AuditResponse;
  siteName: string;
  faviconUrl: string | null;
  code: string;
}

const AXIS_ORDER: AxisName[] = [
  "structuredData",
  "technicalAccessibility",
  "identityConsistency",
  "authoritySignals",
];

export function SharedReportView({ report, siteName, faviconUrl, code }: SharedReportViewProps) {
  return (
    <main className="flex-1 px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <HiArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              {faviconUrl && (
                <img src={faviconUrl} alt="" className="h-5 w-5 rounded" />
              )}
              <div>
                <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                  {siteName}
                </h1>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Código: {code}
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-6 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 truncate max-w-full">
                {report.url}
              </p>
              <ScoreDisplay
                overallScore={report.overallScore}
                maturityLevel={report.maturityLevel}
              />
            </div>
            <div className="lg:col-span-2 flex flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Resumen del análisis
              </h3>
              <SummaryStats data={report} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-5 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              Evaluación por eje
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {AXIS_ORDER.map((axisName) => (
                <AxisSection
                  key={axisName}
                  axisName={axisName}
                  result={report.axes[axisName]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-5 sm:p-6 shadow-sm">
            <ActionPlan items={report.actionPlan} />
          </div>
        </div>
      </div>
    </main>
  );
}
