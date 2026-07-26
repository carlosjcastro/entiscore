"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSelector } from "./LocaleSelector";

interface NavLink {
  labelKey: "analyze" | "compare" | "history" | "about";
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { labelKey: "analyze", href: "/" },
  { labelKey: "compare", href: "/comparar" },
  { labelKey: "history", href: "/historial" },
  { labelKey: "about", href: "/acerca-de" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useI18n();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Entiscore
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[13px] font-medium transition-colors py-1 ${
                  isActiveLink(pathname, link.href)
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {t.nav[link.labelKey]}
                {isActiveLink(pathname, link.href) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            ))}
            <div className="flex items-center gap-1.5 ml-2 pl-4 border-l border-zinc-200 dark:border-zinc-700">
              <LocaleSelector />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <LocaleSelector />
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="relative flex h-8 w-8 items-center justify-center text-zinc-600 dark:text-zinc-300"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className={`absolute h-px w-4 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"}`} />
              <span className={`absolute h-px w-4 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"}`} />
              <span className={`absolute h-px w-4 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={closeMobileMenu} />
          <div className="relative bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`py-2.5 text-[15px] font-medium transition-colors ${
                    isActiveLink(pathname, link.href)
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {t.nav[link.labelKey]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
