"use client";

import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { useI18n } from "@/i18n";

export default function TerminosDeUsoPage() {
  const t = useI18n();

  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-10">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{t.pages.terms.title}</h1>
        </div>

        <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>{t.pages.terms.intro}</p>
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{t.pages.terms.availabilityTitle}</h2>
            <p>{t.pages.terms.availabilityDescription}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{t.pages.terms.resultsTitle}</h2>
            <p>{t.pages.terms.resultsDescription}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{t.pages.terms.responsibilityTitle}</h2>
            <p>{t.pages.terms.responsibilityDescription}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{t.pages.terms.usageTitle}</h2>
            <p>{t.pages.terms.usageDescription}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{t.pages.terms.modificationsTitle}</h2>
            <p>{t.pages.terms.modificationsDescription}</p>
          </section>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-700 pt-4">{t.pages.terms.legalDisclaimer}</p>
        </div>
      </div>
    </main>
  );
}
