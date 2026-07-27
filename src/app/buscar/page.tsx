"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass, HiExclamationTriangle } from "react-icons/hi2";
import { useI18n } from "@/i18n";

type SearchState =
  | { phase: "idle" }
  | { phase: "searching" }
  | { phase: "not-found" };

function normalizeCode(rawInput: string): string {
  const cleaned = rawInput.trim().toLowerCase().replace(/\s+/g, "");

  if (cleaned.includes("-")) {
    return cleaned;
  }

  const numberMatch = cleaned.match(/(\d{3})$/);
  if (!numberMatch) return cleaned;

  const withoutNumber = cleaned.slice(0, -3);
  const number = numberMatch[1];

  if (withoutNumber.length >= 4) {
    const possibleBreakpoints = [3, 4, 5];
    for (const bp of possibleBreakpoints) {
      if (withoutNumber.length > bp) {
        const firstPart = withoutNumber.slice(0, bp);
        const secondPart = withoutNumber.slice(bp);
        if (firstPart.length >= 3 && secondPart.length >= 2) {
          return `${firstPart}-${secondPart}-${number}`;
        }
      }
    }
  }

  return cleaned;
}

async function checkCodeExists(code: string): Promise<boolean> {
  try {
    const response = await fetch(`/r/${code}`, { method: "HEAD", redirect: "manual" });
    return response.ok || response.status === 200;
  } catch {
    return false;
  }
}

function SearchLoadingAnimation({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="h-2 w-2 rounded-full bg-indigo-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function BuscarPage() {
  const [codeInput, setCodeInput] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ phase: "idle" });
  const router = useRouter();
  const t = useI18n();

  const trimmedInput = codeInput.trim();
  const isInputValid = trimmedInput.length >= 5;

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isInputValid) return;

    setSearchState({ phase: "searching" });

    const normalizedCode = normalizeCode(trimmedInput);
    const exists = await checkCodeExists(normalizedCode);

    if (exists) {
      router.push(`/r/${normalizedCode}`);
    } else {
      setSearchState({ phase: "not-found" });
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCodeInput(event.target.value);
    if (searchState.phase === "not-found") {
      setSearchState({ phase: "idle" });
    }
  }

  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {t.pages.search.title}
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="relative">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={codeInput}
              onChange={handleInputChange}
              placeholder={t.pages.search.placeholder}
              disabled={searchState.phase === "searching"}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={!isInputValid || searchState.phase === "searching"}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.pages.search.button}
          </button>
        </form>

        {searchState.phase === "searching" && (
          <SearchLoadingAnimation label={t.pages.search.searching} />
        )}

        {searchState.phase === "not-found" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/80 dark:bg-rose-950/20 p-6 text-center"
          >
            <HiExclamationTriangle className="h-8 w-8 text-rose-500" />
            <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {t.pages.search.notFound}
            </h2>
            <p className="text-[13px] text-rose-600/80 dark:text-rose-400/80 max-w-xs">
              {t.pages.search.notFoundDescription}
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
