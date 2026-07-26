"use client";

import { useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useI18n } from "@/i18n";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [urlInput, setUrlInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = useI18n();

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = urlInput.trim();

    if (trimmedUrl.length === 0) {
      setValidationError(t.form.errorEmpty);
      return;
    }

    if (!isValidHttpUrl(trimmedUrl)) {
      setValidationError(t.form.errorInvalid);
      return;
    }

    setValidationError(null);
    onSubmit(trimmedUrl);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUrlInput(event.target.value);
    if (validationError) {
      setValidationError(null);
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
      <div className="flex w-full flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={urlInput}
            onChange={handleInputChange}
            placeholder={t.form.placeholder}
            disabled={isLoading}
            className={`w-full rounded-md border bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-50 transition-shadow ${
              validationError
                ? "border-rose-300 dark:border-rose-700 focus:ring-rose-500/30"
                : "border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? t.form.buttonLoading : t.form.button}
        </button>
      </div>
      {validationError && (
        <p className="text-[12px] text-rose-600 dark:text-rose-400 pl-1">
          {validationError}
        </p>
      )}
    </form>
  );
}
