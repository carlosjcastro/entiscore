"use client";

import { useState } from "react";
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

function copyReportToClipboard(data: AuditResponse) {
  const jsonText = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonText);
}

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>({ phase: "idle" });

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

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Entiscore
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Analiza tu presencia digital y descubre que tan reconocible eres para
            buscadores e inteligencia artificial.
          </p>
        </header>

        <AuditForm
          onSubmit={handleAuditSubmit}
          isLoading={pageState.phase === "loading"}
        />

        {pageState.phase === "loading" && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Analizando el sitio. Esto puede tomar hasta 60 segundos.
            </p>
          </div>
        )}

        {pageState.phase === "error" && (
          <div className="mt-8 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {pageState.errorData.error}
            </p>
            {pageState.errorData.details && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {pageState.errorData.details}
              </p>
            )}
          </div>
        )}

        {pageState.phase === "result" && (
          <div className="mt-10 flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {pageState.data.url}
              </p>
              <ScoreDisplay
                overallScore={pageState.data.overallScore}
                maturityLevel={pageState.data.maturityLevel}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Evaluacion por eje
              </h3>
              {AXIS_ORDER.map((axisName) => (
                <AxisSection
                  key={axisName}
                  axisName={axisName}
                  result={pageState.data.axes[axisName]}
                />
              ))}
            </div>

            <ActionPlan items={pageState.data.actionPlan} />

            <div className="flex justify-center border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <button
                onClick={() => copyReportToClipboard(pageState.data)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Copiar reporte JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
