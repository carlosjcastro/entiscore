"use client";

import { useState } from "react";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [urlInput, setUrlInput] = useState("");

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = urlInput.trim();
    if (trimmedUrl.length === 0) return;
    onSubmit(trimmedUrl);
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="url"
        value={urlInput}
        onChange={(event) => setUrlInput(event.target.value)}
        placeholder="https://tu-sitio.com"
        required
        disabled={isLoading}
        className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || urlInput.trim().length === 0}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Analizando..." : "Analizar"}
      </button>
    </form>
  );
}
