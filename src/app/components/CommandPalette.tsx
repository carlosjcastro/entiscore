"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiMagnifyingGlass, HiGlobeAlt, HiMoon } from "react-icons/hi2";
import { useI18n, useLocale } from "@/i18n";

interface CommandItem {
  id: string;
  label: string;
  action: () => void;
  icon?: React.ReactNode;
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.96, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const PANEL_TRANSITION = { duration: 0.15, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useI18n();
  const { locale, setLocale } = useLocale();

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("entiscore-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("entiscore-theme", "dark");
    }
  }

  function toggleLocale() {
    const nextLocale = locale === "es" ? "en" : "es";
    setLocale(nextLocale);
  }

  const commands: CommandItem[] = [
    { id: "analyze", label: t.nav.analyze, action: () => router.push("/"), icon: <HiMagnifyingGlass className="h-4 w-4" /> },
    { id: "compare", label: t.nav.compare, action: () => router.push("/comparar"), icon: <HiGlobeAlt className="h-4 w-4" /> },
    { id: "history", label: t.nav.history, action: () => router.push("/historial") },
    { id: "about", label: t.nav.about, action: () => router.push("/acerca-de") },
    { id: "locale", label: locale === "es" ? "Switch to English" : "Cambiar a Espanol", action: toggleLocale, icon: <HiGlobeAlt className="h-4 w-4" /> },
    { id: "theme-toggle", label: t.theme.dark, action: toggleTheme, icon: <HiMoon className="h-4 w-4" /> },
  ];

  const filteredCommands = query.length === 0
    ? commands
    : commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()));

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (isOpen) close();
        else open();
      }
      if (event.key === "Escape" && isOpen) {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleItemKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
        close();
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[20vh]"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={OVERLAY_VARIANTS}
          transition={{ duration: 0.1 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
            variants={PANEL_VARIANTS}
            transition={PANEL_TRANSITION}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <HiMagnifyingGlass className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleItemKeyDown}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                Esc
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto py-2">
              {filteredCommands.length === 0 && (
                <p className="px-4 py-3 text-[13px] text-zinc-400 text-center">
                  Sin resultados
                </p>
              )}
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); close(); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors ${
                    index === selectedIndex
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {cmd.icon && <span className="shrink-0 text-zinc-400">{cmd.icon}</span>}
                  <span className="flex-1">{cmd.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
      aria-label="Abrir buscador"
    >
      <HiMagnifyingGlass className="h-3 w-3" />
      <span>Ctrl K</span>
    </button>
  );
}
