"use client";

import { useLocale } from "@/i18n";
import type { Locale } from "@/i18n";

export function LocaleSelector() {
  const { locale, setLocale } = useLocale();

  function handleToggle() {
    const newLocale: Locale = locale === "es" ? "en" : "es";
    setLocale(newLocale);
  }

  return (
    <button
      onClick={handleToggle}
      className="flex h-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 tabular-nums"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
