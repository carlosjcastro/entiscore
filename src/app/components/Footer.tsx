"use client";

import Link from "next/link";
import { HiGlobeAlt } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";
import { useI18n } from "@/i18n";
import Image from "next/image";

const GITHUB_REPO_URL = "https://github.com/carlosjcastro/entiscore";

const INTERNAL_LINK_CLASS = "text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useI18n();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/entiscore.png"
                alt="Entiscore"
                width={40}
                height={40}
              />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Entiscore
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs">
              {t.hero.description}
            </p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
            >
              <FaGithub className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t.footer.product}
            </span>
            <nav className="flex flex-col gap-2">
              <Link href="/" className={INTERNAL_LINK_CLASS}>
                {t.footer.analyzeLink}
              </Link>
              <Link href="/comparar" className={INTERNAL_LINK_CLASS}>
                {t.footer.compareLink}
              </Link>
              <Link href="/historial" className={INTERNAL_LINK_CLASS}>
                {t.footer.historyLink}
              </Link>
              <Link href="/api-docs" className={INTERNAL_LINK_CLASS}>
                {t.footer.apiDocs}
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={INTERNAL_LINK_CLASS}
              >
                {t.footer.repoLink}
              </a>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t.footer.info}
            </span>
            <nav className="flex flex-col gap-2">
              <Link href="/acerca-de" className={INTERNAL_LINK_CLASS}>
                {t.footer.aboutLink}
              </Link>
              <Link href="/equipo" className={INTERNAL_LINK_CLASS}>
                {t.footer.teamLink}
              </Link>
              <Link href="/derechos-de-autor" className={INTERNAL_LINK_CLASS}>
                {t.footer.copyrightLink}
              </Link>
              <Link href="/terminos-de-uso" className={INTERNAL_LINK_CLASS}>
                {t.footer.termsLink}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {currentYear} Carlos José Castro Galante y Matías Edgardo Tula Sarquis. {t.footer.rights}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("entiscore-cookie-consent");
              window.location.reload();
            }}
            className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
          >
            {t.footer.cookiePrefs}
          </button>
        </div>
      </div>
    </footer>
  );
}
