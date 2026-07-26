"use client";

import { useEffect, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useToast } from "./Toast";
import { useI18n } from "@/i18n";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "entiscore-theme";

function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

function applyThemeToDocument(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

interface ThemeToggleProps {
  variant?: "default" | "hero";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const { showToast } = useToast();
  const t = useI18n();

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme ?? getSystemPreference();
    setTheme(initialTheme);
    applyThemeToDocument(initialTheme);
  }, []);

  function toggleTheme() {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeToDocument(newTheme);
    showToast(newTheme === "dark" ? t.theme.dark : t.theme.light);
  }

  const buttonClass = variant === "hero"
    ? "flex h-8 w-8 items-center justify-center border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
    : "flex h-8 w-8 items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100";

  return (
    <button
      onClick={toggleTheme}
      className={buttonClass}
      aria-label={theme === "dark" ? t.theme.light : t.theme.dark}
    >
      {theme === "dark" ? (
        <HiSun className="h-4 w-4" />
      ) : (
        <HiMoon className="h-4 w-4" />
      )}
    </button>
  );
}
