"use client";

import { useLocale } from "@/i18n";
import type { Locale } from "@/i18n";
import { useToast } from "./Toast";

const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export function LocaleSelector() {
  const { locale, setLocale } = useLocale();
  const { showToast } = useToast();

  function handleToggle() {
    const newLocale: Locale = locale === "es" ? "en" : "es";
    setLocale(newLocale);
    showToast(LOCALE_LABELS[newLocale]);
  }

  return (
    <button
      onClick={handleToggle}
      className="flex h-8 items-center justify-center px-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 tabular-nums"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
