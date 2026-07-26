"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowLeft, HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import type { AuditResponse, AxisName } from "@/types";
import { ScoreDisplay } from "@/app/components/ScoreDisplay";
import { AxisSection } from "@/app/components/AxisSection";
import { ActionPlan } from "@/app/components/ActionPlan";
import { AnalysisProgress } from "@/app/components/AnalysisProgress";
import { ShareMenu } from "@/app/components/ShareMenu";
import { ChatPanel } from "@/app/components/ChatPanel";
import { useI18n, useLocale } from "@/i18n";
import { isStrictlyValidUrl } from "@/lib/url-validation";
import {
  fadeInUp,
  fadeInScale,
  slideInFromLeft,
  slideInFromRight,
  staggerContainerSlow,
  getVariants,
  getStaggerVariants,
  useMotionSafe,
} from "@/lib/motion";
import { ScrollReveal } from "@/app/components/ScrollReveal";

interface CompareResult {
  reportA: AuditResponse;
  reportB: AuditResponse;
  siteNameA: string;
  siteNameB: string;
  code: string | null;
}

type CompareState =
  | { phase: "idle" }
  | { phase: "loading"; urlA: string; urlB: string }
  | { phase: "result"; result: CompareResult }
  | { phase: "error"; errorMessage: string };

const AXIS_ORDER: AxisName[] = [
  "structuredData",
  "technicalAccessibility",
  "identityConsistency",
  "authoritySignals",
];

const AXIS_LABELS: Record<AxisName, string> = {
  structuredData: "Datos estructurados",
  identityConsistency: "Consistencia de identidad",
  authoritySignals: "Señales de autoridad",
  technicalAccessibility: "Accesibilidad técnica",
};

async function requestComparison(urlA: string, urlB: string, locale: string): Promise<CompareResult> {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urlA, urlB, locale }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Error al comparar");
  }

  return {
    reportA: body.reportA,
    reportB: body.reportB,
    siteNameA: body.siteNameA,
    siteNameB: body.siteNameB,
    code: body.code ?? null,
  };
}

function normalizeUrlForComparison(value: string): string {
  try {
    const url = new URL(value);
    const normalized = `${url.protocol}//${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, "")}${url.search}`;
    return normalized;
  } catch {
    return value.toLowerCase().replace(/\/$/, "");
  }
}

function areUrlsEquivalent(urlA: string, urlB: string): boolean {
  return normalizeUrlForComparison(urlA) === normalizeUrlForComparison(urlB);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ComparisonSummary({ reportA, reportB }: { reportA: AuditResponse; reportB: AuditResponse }) {
  const t = useI18n();
  const scoreDifference = reportA.overallScore - reportB.overallScore;
  const winnerDomain = scoreDifference > 0
    ? extractDomain(reportA.url)
    : scoreDifference < 0
      ? extractDomain(reportB.url)
      : null;
  const absoluteDifference = Math.abs(scoreDifference);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-5 sm:p-6 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
        {t.compare.summaryTitle}
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
            Score general:
          </span>
          {winnerDomain ? (
            <span className="text-[13px] text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold">{winnerDomain}</span> {t.compare.beatsBy} {absoluteDifference}
            </span>
          ) : (
            <span className="text-[13px] text-zinc-500 dark:text-zinc-400">{t.compare.same}</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AXIS_ORDER.map((axisName) => {
            const scoreA = reportA.axes[axisName].score;
            const scoreB = reportB.axes[axisName].score;
            const diff = scoreA - scoreB;
            return (
              <div key={axisName} className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400 flex-1">
                  {AXIS_LABELS[axisName]}
                </span>
                {diff > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <HiArrowTrendingUp className="h-3 w-3" />
                    A +{diff}
                  </span>
                )}
                {diff < 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <HiArrowTrendingDown className="h-3 w-3" />
                    B +{Math.abs(diff)}
                  </span>
                )}
                {diff === 0 && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{t.compare.equal}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompareForm({ onSubmit, isLoading }: { onSubmit: (urlA: string, urlB: string) => void; isLoading: boolean }) {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = useI18n();

  const trimmedA = urlA.trim();
  const trimmedB = urlB.trim();
  const isFormValid = trimmedA.length > 0 && trimmedB.length > 0 && isStrictlyValidUrl(trimmedA) && isStrictlyValidUrl(trimmedB) && !areUrlsEquivalent(trimmedA, trimmedB);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedA.length === 0 || trimmedB.length === 0) {
      setValidationError(t.compare.errorBothRequired);
      return;
    }

    if (!isStrictlyValidUrl(trimmedA) || !isStrictlyValidUrl(trimmedB)) {
      setValidationError(t.compare.errorBothInvalid);
      return;
    }

    if (areUrlsEquivalent(trimmedA, trimmedB)) {
      setValidationError(t.compare.errorSameUrl);
      return;
    }

    setValidationError(null);
    onSubmit(trimmedA, trimmedB);
  }

  function handleInputChange(setter: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      if (validationError) setValidationError(null);
    };
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Sitio A
          </label>
          <input
            type="text"
            value={urlA}
            onChange={handleInputChange(setUrlA)}
            placeholder="https://primer-sitio.com"
            disabled={isLoading}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-shadow"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Sitio B
          </label>
          <input
            type="text"
            value={urlB}
            onChange={handleInputChange(setUrlB)}
            placeholder="https://segundo-sitio.com"
            disabled={isLoading}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-shadow"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full sm:w-auto sm:self-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isLoading ? t.compare.buttonLoading : t.compare.button}
      </button>
      {validationError && (
        <p className="text-[12px] text-rose-600 dark:text-rose-400 text-center">
          {validationError}
        </p>
      )}
    </form>
  );
}

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

export default function CompararPage() {
  const [state, setState] = useState<CompareState>({ phase: "idle" });
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const t = useI18n();
  const { locale } = useLocale();

  async function handleCompare(urlA: string, urlB: string) {
    setState({ phase: "loading", urlA, urlB });
    setAnalysisComplete(false);

    try {
      const result = await requestComparison(urlA, urlB, locale);
      setAnalysisComplete(true);
      setTimeout(() => {
        setState({ phase: "result", result });
      }, 600);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al comparar";
      setState({ phase: "error", errorMessage });
    }
  }

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
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {t.compare.title}
            </h1>
          </div>
        </div>

        <div className="mb-8">
          <CompareForm
            onSubmit={handleCompare}
            isLoading={state.phase === "loading"}
          />
        </div>

        {state.phase === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                {extractDomain(state.urlA)}
              </p>
              <AnalysisProgress isComplete={analysisComplete} />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                {extractDomain(state.urlB)}
              </p>
              <AnalysisProgress isComplete={analysisComplete} />
            </div>
          </div>
        )}

        {state.phase === "error" && (
          <div className="max-w-2xl mx-auto rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/80 dark:bg-rose-950/30 p-4 sm:p-5">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {state.errorMessage}
            </p>
          </div>
        )}

        {state.phase === "result" && (
          <ComparisonResult result={state.result} />
        )}

        {state.phase === "idle" && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-md">
              Ingresa dos URLs arriba para comparar su madurez de entidad digital lado a lado y descubrir cuál tiene mejor presencia ante buscadores e IA.
            </p>
          </div>
        )}
      </div>
      {state.phase === "result" && state.result.code && (
        <ChatPanel code={state.result.code} />
      )}
    </main>
  );
}

function ComparisonResult({ result }: { result: CompareResult }) {
  const motionSafe = useMotionSafe();

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={getStaggerVariants(motionSafe, staggerContainerSlow)}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={getVariants(motionSafe, fadeInScale)}>
        <ComparisonSummary reportA={result.reportA} reportB={result.reportB} />
      </motion.div>

      {result.code && (
        <motion.div variants={getVariants(motionSafe, fadeInUp)} className="flex justify-center">
          <ShareMenu
            code={result.code}
            siteName={result.siteNameA}
            score={result.reportA.overallScore}
            comparisonSiteNameB={result.siteNameB}
            comparisonScoreB={result.reportB.overallScore}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={getVariants(motionSafe, slideInFromLeft)}>
          <ReportColumn report={result.reportA} label="Sitio A" />
        </motion.div>
        <motion.div variants={getVariants(motionSafe, slideInFromRight)}>
          <ReportColumn report={result.reportB} label="Sitio B" />
        </motion.div>
      </div>
    </motion.div>
  );
}
