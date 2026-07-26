"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale, Dictionary } from "./types";
import { es } from "./es";
import { en } from "./en";

const LOCALE_STORAGE_KEY = "entiscore-locale";
const LOCALE_COOKIE_NAME = "entiscore-locale";

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "es",
  t: es,
  setLocale: () => {},
});

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "es";
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  return browserLang === "en" ? "en" : "es";
}

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  return null;
}

function setCookieLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const stored = getStoredLocale();
    const initial = stored ?? detectBrowserLocale();
    setLocaleState(initial);
    setCookieLocale(initial);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setCookieLocale(newLocale);
  }, []);

  const t = DICTIONARIES[locale];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): Dictionary {
  return useContext(I18nContext).t;
}

export function useLocale(): { locale: Locale; setLocale: (locale: Locale) => void } {
  const { locale, setLocale } = useContext(I18nContext);
  return { locale, setLocale };
}
