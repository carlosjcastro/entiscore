"use client";

import { useEffect, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";

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
  }

  const buttonClass = variant === "hero"
    ? "flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
    : "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700";

  return (
    <button
      onClick={toggleTheme}
      className={buttonClass}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <HiSun className="h-4 w-4" />
      ) : (
        <HiMoon className="h-4 w-4" />
      )}
    </button>
  );
}
