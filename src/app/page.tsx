"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { HiDocumentDuplicate, HiCheck } from "react-icons/hi2";
import type { AuditResponse, AuditErrorResponse, AxisName } from "@/types";
import { useI18n, useLocale } from "@/i18n";
import { AuditForm } from "./components/AuditForm";
import { ScoreDisplay } from "./components/ScoreDisplay";
import { SummaryStats } from "./components/SummaryStats";
import { AxisSection } from "./components/AxisSection";
import { ActionPlan } from "./components/ActionPlan";
import { ScoreBadge } from "./components/ScoreBadge";
import { ShareMenu } from "./components/ShareMenu";
import { ChatPanel } from "./components/ChatPanel";
import { EntityGraph } from "./components/EntityGraph";
import { FeaturesSection } from "./components/FeaturesSection";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { CookieBanner } from "./components/CookieBanner";
import { SplashScreen } from "./components/SplashScreen";
import { saveAuditToHistory, getPreviousReportForUrl } from "./lib/history-storage";

const NetworkGraph = dynamic(
  () => import("./components/NetworkGraph").then((mod) => ({ default: mod.NetworkGraph })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-zinc-950" style={{ zIndex: 0 }} /> }
);

type PageState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; data: AuditResponse }
  | { phase: "error"; errorData: AuditErrorResponse };

const AXIS_ORDER: AxisName[] = [
  "structuredData",
  "technicalAccessibility",
  "identityConsistency",
  "authoritySignals",
];

async function requestAudit(url: string, locale: string): Promise<AuditResponse> {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, locale }),
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    throw body as AuditErrorResponse;
  }

  return body as AuditResponse;
}

function AutoAuditTrigger({ onAudit }: { onAudit: (url: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const auditUrl = searchParams.get("audit");
    if (auditUrl) {
      onAudit(auditUrl);
    }
  }, [searchParams, onAudit]);

  return null;
}

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>({ phase: "idle" });
  const [isCopied, setIsCopied] = useState(false);
  const [analysisJustCompleted, setAnalysisJustCompleted] = useState(false);
  const [previousReport, setPreviousReport] = useState<AuditResponse | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const t = useI18n();
  const { locale } = useLocale();

  async function handleAuditSubmit(url: string) {
    setPageState({ phase: "loading" });
    setPreviousReport(getPreviousReportForUrl(url));
    setAnalysisJustCompleted(false);

    try {
      const rawData = await requestAudit(url, locale);
      const responseWithExtras = rawData as AuditResponse & { code?: string; siteName?: string };
      setShareCode(responseWithExtras.code ?? null);
      setSiteName(responseWithExtras.siteName ?? null);
      saveAuditToHistory(rawData);
      setAnalysisJustCompleted(true);
      setTimeout(() => {
        setPageState({ phase: "result", data: rawData });
      }, 600);
    } catch (error) {
      const errorData = error as AuditErrorResponse;
      setPageState({
        phase: "error",
        errorData: errorData.code
          ? errorData
          : { error: t.errors.connectionError, code: "INTERNAL_ERROR" },
      });
    }
  }

  function handleCopyReport() {
    if (pageState.phase !== "result") return;
    const jsonText = JSON.stringify(pageState.data, null, 2);
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <>
      <SplashScreen />
      <Suspense fallback={null}>
        <AutoAuditTrigger onAudit={handleAuditSubmit} />
      </Suspense>
      <section className="relative flex flex-col items-center justify-center min-h-[520px] sm:min-h-[560px] px-4 py-16 sm:py-20 overflow-hidden bg-zinc-950">
        <NetworkGraph />
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white text-center">
            {t.hero.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto text-center leading-relaxed">
            {t.hero.description}
          </p>
          <div className="mt-8 w-full">
            <AuditForm
              onSubmit={handleAuditSubmit}
              isLoading={pageState.phase === "loading"}
            />
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-6xl">
          {pageState.phase === "idle" && (
            <FeaturesSection
              onQuickAudit={handleAuditSubmit}
              isLoading={false}
            />
          )}

          {pageState.phase === "loading" && (
            <AnalysisProgress isComplete={analysisJustCompleted} />
          )}

          {pageState.phase === "error" && (
            <div className="max-w-2xl mx-auto py-8 border-l-[3px] border-rose-500 pl-4">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {pageState.errorData.error}
              </p>
              {pageState.errorData.details && (
                <p className="mt-1.5 text-[13px] text-rose-600/80 dark:text-rose-400/80">
                  {pageState.errorData.details}
                </p>
              )}
            </div>
          )}

          {pageState.phase === "result" && (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-col items-center lg:items-start gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {pageState.data.url}
                  </p>
                  <ScoreDisplay
                    overallScore={pageState.data.overallScore}
                    maturityLevel={pageState.data.maturityLevel}
                    previousScore={previousReport?.overallScore}
                  />
                </div>
                <SummaryStats data={pageState.data} />
              </div>

              {pageState.data.executiveSummary && (
                <div className="border-l-[3px] border-indigo-500 pl-4 py-1">
                  <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                    {pageState.data.executiveSummary}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-5">
                  {t.report.evaluationByAxis}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {AXIS_ORDER.map((axisName, index) => (
                    <div
                      key={axisName}
                      className="animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
                    >
                      <AxisSection
                        axisName={axisName}
                        result={pageState.data.axes[axisName]}
                        previousScore={previousReport?.axes[axisName]?.score}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8">
                <ActionPlan items={pageState.data.actionPlan} />
              </div>

              <EntityGraph report={pageState.data} />

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 text-center">
                  {t.report.badge}
                </h3>
                <ScoreBadge report={pageState.data} />
              </div>

              <div className="flex justify-center gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {shareCode && siteName && (
                  <ShareMenu
                    code={shareCode}
                    siteName={siteName}
                    score={pageState.data.overallScore}
                  />
                )}
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 shadow-sm transition-all hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98]"
                >
                  {isCopied ? (
                    <>
                      <HiCheck className="h-4 w-4 text-emerald-500" />
                      {t.report.copied}
                    </>
                  ) : (
                    <>
                      <HiDocumentDuplicate className="h-4 w-4" />
                      {t.report.copyJson}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <CookieBanner />
      {shareCode && <ChatPanel code={shareCode} />}
    </>
  );
}
