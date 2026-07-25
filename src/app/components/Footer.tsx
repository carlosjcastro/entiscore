"use client";

import { HiGlobeAlt } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";

const GITHUB_REPO_URL = "https://github.com/carlosjcastro/entiscore";

export function Footer() {
  const currentYear = new Date().getFullYear();

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <HiGlobeAlt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Entiscore
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs">
              Auditor de entidad digital. Analiza tu presencia online y genera un plan de
              acción para mejorar tu reconocimiento ante buscadores e inteligencia artificial.
            </p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
            >
              <FaGithub className="h-3.5 w-3.5" />
              Ver en GitHub
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Producto
            </span>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left w-fit"
              >
                Analizar un sitio
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left w-fit"
              >
                Ejes de evaluación
              </button>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
              >
                Repositorio del proyecto
              </a>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Sobre el proyecto
            </span>
            <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Construido para el hackathon de Código Facilito, Kiro powered by AWS,
              usando Kiro como herramienta central de desarrollo con Spec Driven Development,
              steering de estándares y MCP tools.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {currentYear} Carlos José Castro Galante y Matías Edgardo Tula Sarquis. Todos los derechos reservados.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("entiscore-cookie-consent");
              window.location.reload();
            }}
            className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
          >
            Preferencias de cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
