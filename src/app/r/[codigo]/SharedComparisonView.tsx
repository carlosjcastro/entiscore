"use client";

import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import type { AuditResponse, AxisName } from "@/types";
import { ScoreDisplay } from "@/app/components/ScoreDisplay";
import { AxisSection } from "@/app/components/AxisSection";
import { ActionPlan } from "@/app/components/ActionPlan";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ShareMenu } from "@/app/components/ShareMenu";
import { ChatPanel } from "@/app/components/ChatPanel";

interface SharedComparisonViewProps {
  reportA: AuditResponse;
  reportB: AuditResponse;
  siteNameA: string;
  siteNameB: string;
  code: string;
}

const AXIS_ORDER: AxisName[] = [
  "structuredData",
  "technicalAccessibility",
  "identityConsistency",
  "authoritySignals",
];

function ReportColumn({ report, label }: { report: AuditResponse; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate mb-4">
          {report.url}
        </p>
        <div className="flex justify-center">
          <ScoreDisplay overallScore={report.overallScore} maturityLevel={report.maturityLevel} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {AXIS_ORDER.map((axisName) => (
          <AxisSection key={axisName} axisName={axisName} result={report.axes[axisName]} />
        ))}
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-4 shadow-sm">
        <ActionPlan items={report.actionPlan} />
      </div>
    </div>
  );
}

export function SharedComparisonView({ reportA, reportB, siteNameA, siteNameB, code }: SharedComparisonViewProps) {
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
            <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {siteNameA} vs {siteNameB}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareMenu
              code={code}
              siteName={siteNameA}
              score={reportA.overallScore}
              comparisonSiteNameB={siteNameB}
              comparisonScoreB={reportB.overallScore}
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportColumn report={reportA} label="Sitio A" />
          <ReportColumn report={reportB} label="Sitio B" />
        </div>
      </div>
      <ChatPanel code={code} />
    </main>
  );
}
