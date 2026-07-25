"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiDocumentDuplicate, HiCheck } from "react-icons/hi2";
import type { AuditResponse, AuditErrorResponse, AxisName } from "@/types";
import { AuditForm } from "./components/AuditForm";
import { ScoreDisplay } from "./components/ScoreDisplay";
import { SummaryStats } from "./components/SummaryStats";
import { AxisSection } from "./components/AxisSection";
import { ActionPlan } from "./components/ActionPlan";
import { ThemeToggle } from "./components/ThemeToggle";
import { FeaturesSection } from "./components/FeaturesSection";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { CookieBanner } from "./components/CookieBanner";
import { Footer } from "./components/Footer";
import { SplashScreen } from "./components/SplashScreen";
import { saveAuditToHistory } from "./lib/history-storage";

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

async function requestAudit(url: string): Promise<AuditResponse> {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    throw body as AuditErrorResponse;
  }

  return body as AuditResponse;
}

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>({ phase: "idle" });
  const [isCopied, setIsCopied] = useState(false);
  const [analysisJustCompleted, setAnalysisJustCompleted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const auditUrl = searchParams.get("audit");
    if (auditUrl) {
      handleAuditSubmit(auditUrl);
    }
  }, []);

  async function handleAuditSubmit(url: string) {
    setPageState({ phase: "loading" });
    setAnalysisJustCompleted(false);

    try {
      const data = await requestAudit(url);
      saveAuditToHistory(data);
      setAnalysisJustCompleted(true);
      setTimeout(() => {
        setPageState({ phase: "result", data });
      }, 600);
    } catch (error) {
      const errorData = error as AuditErrorResponse;
      setPageState({
        phase: "error",
        errorData: errorData.code
          ? errorData
          : { error: "Error de conexión con el servidor", code: "INTERNAL_ERROR" },
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
      <section className="relative flex flex-col items-center justify-center min-h-[520px] sm:min-h-[560px] px-4 py-16 sm:py-20 overflow-hidden bg-zinc-950">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Link
            href="/historial"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 text-[12px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Historial
          </Link>
          <ThemeToggle variant="hero" />
        </div>
        <NetworkGraph />
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white text-center">
            Entiscore
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto text-center leading-relaxed">
            Analiza tu presencia digital y descubre qué tan reconocible eres
            para buscadores e inteligencia artificial.
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
            <div className="max-w-2xl mx-auto py-8 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/80 dark:bg-rose-950/30 p-4 sm:p-5">
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
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-6 shadow-sm">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 truncate max-w-full">
                    {pageState.data.url}
                  </p>
                  <ScoreDisplay
                    overallScore={pageState.data.overallScore}
                    maturityLevel={pageState.data.maturityLevel}
                  />
                </div>
                <div className="lg:col-span-2 flex flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                    Resumen del análisis
                  </h3>
                  <SummaryStats data={pageState.data} />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-5 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
                  Evaluación por eje
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {AXIS_ORDER.map((axisName, index) => (
                    <div
                      key={axisName}
                      className="animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
                    >
                      <AxisSection
                        axisName={axisName}
                        result={pageState.data.axes[axisName]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-5 sm:p-6 shadow-sm">
                <ActionPlan items={pageState.data.actionPlan} />
              </div>

              <div className="flex justify-center pt-2 pb-4">
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 shadow-sm transition-all hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98]"
                >
                  {isCopied ? (
                    <>
                      <HiCheck className="h-4 w-4 text-emerald-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <HiDocumentDuplicate className="h-4 w-4" />
                      Copiar reporte JSON
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </>
  );
}
