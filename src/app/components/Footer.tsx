"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { useI18n } from "@/i18n";

const GITHUB_URL = "https://github.com/carlosjcastro/entiscore";

const SOCIAL_LINKS = [
  { icon: FaGithub, href: GITHUB_URL, label: "GitHub" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/in/carlosjcastro", label: "Carlos José Castro Galante" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/in/matías-edgardo-tula-sarquis/", label: "Matias Edgardo Tula Sarquis" },
];

const LINK_CLASS = "text-[13px] text-zinc-400 hover:text-indigo-400 transition-colors w-fit";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useI18n();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo/entiscore.png"
                alt="Entiscore"
                width={32}
                height={32}
                className="h-auto w-auto"
              />
              <span className="text-sm font-bold text-white">
                Entiscore
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-500 max-w-[220px]">
              {t.hero.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {t.footer.product}
            </span>
            <nav className="flex flex-col gap-2.5">
              <Link href="/" className={LINK_CLASS}>
                {t.footer.analyzeLink}
              </Link>
              <Link href="/comparar" className={LINK_CLASS}>
                {t.footer.compareLink}
              </Link>
              <Link href="/historial" className={LINK_CLASS}>
                {t.footer.historyLink}
              </Link>
              <Link href="/api-docs" className={LINK_CLASS}>
                {t.footer.apiDocs}
              </Link>
              <Link href="/buscar" className={LINK_CLASS}>
                {t.footer.searchLink}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {t.footer.info}
            </span>
            <nav className="flex flex-col gap-2.5">
              <Link href="/acerca-de" className={LINK_CLASS}>
                {t.footer.aboutLink}
              </Link>
              <Link href="/equipo" className={LINK_CLASS}>
                {t.footer.teamLink}
              </Link>
              <Link href="/derechos-de-autor" className={LINK_CLASS}>
                {t.footer.copyrightLink}
              </Link>
              <Link href="/terminos-de-uso" className={LINK_CLASS}>
                {t.footer.termsLink}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {t.footer.social}
            </span>
            <div className="flex flex-col gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors w-fit"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[12px]">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-zinc-500">
            {currentYear} Carlos Jose Castro Galante y Matias Edgardo Tula Sarquis. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/derechos-de-autor" className="text-[11px] text-zinc-500 hover:text-indigo-400 transition-colors">
              {t.footer.copyrightLink}
            </Link>
            <Link href="/terminos-de-uso" className="text-[11px] text-zinc-500 hover:text-indigo-400 transition-colors">
              {t.footer.termsLink}
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("entiscore-cookie-consent");
                window.location.reload();
              }}
              className="text-[11px] text-zinc-500 hover:text-indigo-400 transition-colors"
            >
              {t.footer.cookiePrefs}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
