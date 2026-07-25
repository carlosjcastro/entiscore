"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiArrowPath, HiArrowDownTray, HiTrash, HiDocumentText, HiArrowLeft } from "react-icons/hi2";
import type { MaturityLevel } from "@/types";
import {
  getHistoryEntries,
  getFullReport,
  deleteHistoryEntry,
  clearAllHistory,
  type HistoryEntry,
} from "@/app/lib/history-storage";
import { generateAuditPdf } from "@/app/lib/pdf-export";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const MATURITY_COLOR_MAP: Record<MaturityLevel, string> = {
  bajo: "text-rose-600 dark:text-rose-400",
  medio: "text-amber-600 dark:text-amber-400",
  alto: "text-emerald-600 dark:text-emerald-400",
  excelente: "text-green-600 dark:text-green-400",
};

const MATURITY_BADGE_MAP: Record<MaturityLevel, string> = {
  bajo: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  medio: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  alto: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  excelente: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setEntries(getHistoryEntries());
    setIsLoaded(true);
  }, []);

  function handleDelete(entryId: string) {
    deleteHistoryEntry(entryId);
    setEntries(getHistoryEntries());
  }

  function handleClearAll() {
    clearAllHistory();
    setEntries([]);
  }

  function handleExportJson(entry: HistoryEntry) {
    const report = getFullReport(entry.id);
    if (!report) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `entiscore-${new URL(entry.url).hostname}-${new Date(entry.date).toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPdf(entry: HistoryEntry) {
    const report = getFullReport(entry.id);
    if (!report) return;
    generateAuditPdf(report);
  }

  function handleRepeatAnalysis(url: string) {
    window.location.href = `/?audit=${encodeURIComponent(url)}`;
  }

  if (!isLoaded) return null;

  return (
    <main className="flex-1 px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <HiArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              Historial de análisis
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {entries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-[12px] font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/40"
              >
                <HiTrash className="h-3.5 w-3.5" />
                Vaciar historial
              </button>
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <HiDocumentText className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No hay análisis guardados todavía.
            </p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
              Los resultados se guardan automáticamente cuando aceptas las cookies.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Analizar un sitio
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/30 p-4 sm:p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {entry.url}
                    </p>
                    <p className="mt-1 text-[12px] text-zinc-400 dark:text-zinc-500">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-lg font-bold tabular-nums ${MATURITY_COLOR_MAP[entry.maturityLevel]}`}>
                      {entry.overallScore}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${MATURITY_BADGE_MAP[entry.maturityLevel]}`}>
                      {entry.maturityLevel}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 dark:border-zinc-700/40 pt-3">
                  <button
                    onClick={() => handleRepeatAnalysis(entry.url)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <HiArrowPath className="h-3 w-3" />
                    Repetir
                  </button>
                  <button
                    onClick={() => handleExportJson(entry)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <HiArrowDownTray className="h-3 w-3" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExportPdf(entry)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <HiDocumentText className="h-3 w-3" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  >
                    <HiTrash className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
