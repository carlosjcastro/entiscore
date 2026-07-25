"use client";

import { useState } from "react";
import { HiDocumentDuplicate, HiCheck } from "react-icons/hi2";
import type { AuditResponse, AuditErrorResponse, AxisName } from "@/types";
import { AuditForm } from "./components/AuditForm";
import { ScoreDisplay } from "./components/ScoreDisplay";
import { AxisSection } from "./components/AxisSection";
import { ActionPlan } from "./components/ActionPlan";

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

  async function handleAuditSubmit(url: string) {
    setPageState({ phase: "loading" });

    try {
      const data = await requestAudit(url);
      setPageState({ phase: "result", data });
    } catch (error) {
      const errorData = error as AuditErrorResponse;
      setPageState({
        phase: "error",
        errorData: errorData.code
          ? errorData
          : { error: "Error de conexion con el servidor", code: "INTERNAL_ERROR" },
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
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Entiscore
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Analiza tu presencia digital y descubre que tan reconocible eres
            para buscadores e inteligencia artificial.
          </p>
        </header>

        <AuditForm
          onSubmit={handleAuditSubmit}
          isLoading={pageState.phase === "loading"}
        />

        {pageState.phase === "loading" && (
          <div className="mt-16 flex flex-col items-center gap-4 animate-in fade-in">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200" />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Analizando el sitio. Esto puede tomar hasta 60 segundos.
            </p>
          </div>
        )}

        {pageState.phase === "error" && (
          <div className="mt-8 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/80 dark:bg-rose-950/30 p-4 sm:p-5 animate-in fade-in">
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
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 bg-zinc-50/50 dark:bg-zinc-900/30 p-5 sm:p-8 flex flex-col gap-8 sm:gap-10">
              <div className="flex flex-col items-center gap-3">
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {pageState.data.url}
                </p>
                <ScoreDisplay
                  overallScore={pageState.data.overallScore}
                  maturityLevel={pageState.data.maturityLevel}
                />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Evaluacion por eje
                </h3>
                <div className="flex flex-col gap-2.5">
                  {AXIS_ORDER.map((axisName) => (
                    <AxisSection
                      key={axisName}
                      axisName={axisName}
                      result={pageState.data.axes[axisName]}
                    />
                  ))}
                </div>
              </div>

              <ActionPlan items={pageState.data.actionPlan} />

              <div className="flex justify-center border-t border-zinc-200/80 dark:border-zinc-700/50 pt-5">
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98]"
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
          </div>
        )}
      </div>
    </main>
  );
}
