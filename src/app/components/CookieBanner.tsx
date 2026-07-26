"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";

const COOKIE_CONSENT_KEY = "entiscore-cookie-consent";

type ConsentState = "pending" | "accepted" | "rejected";

function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === "accepted" || stored === "rejected") return stored;
  return "pending";
}

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>("accepted");
  const t = useI18n();

  useEffect(() => {
    setConsent(getStoredConsent());
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
  }

  function handleReject() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsent("rejected");
  }

  if (consent !== "pending") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t.cookies.message}
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {t.cookies.reject}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-[13px] font-medium text-white dark:text-zinc-900 transition-colors hover:opacity-90"
          >
            {t.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
