"use client";

import { HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt } from "react-icons/hi2";

interface FeatureCardProps {
  icon: typeof HiCodeBracketSquare;
  title: string;
  description: string;
  accentColor: string;
}

const FEATURES: FeatureCardProps[] = [
  {
    icon: HiCodeBracketSquare,
    title: "Datos estructurados",
    description: "Verifica si tu sitio tiene schema markup que identifique quién eres ante buscadores e IA.",
    accentColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: HiUser,
    title: "Consistencia de identidad",
    description: "Compara tu nombre y perfiles entre fuentes para confirmar que te reconocen como una sola entidad.",
    accentColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: HiShieldCheck,
    title: "Señales de autoridad",
    description: "Detecta enlaces a plataformas profesionales, autoría definida y menciones de logros.",
    accentColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: HiGlobeAlt,
    title: "Accesibilidad técnica",
    description: "Evalúa si crawlers e IA pueden acceder a tu contenido sin barreras técnicas.",
    accentColor: "text-indigo-600 dark:text-indigo-400",
  },
];

function FeatureCard({ icon: Icon, title, description, accentColor }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-zinc-100 dark:border-zinc-800 sm:border-b-0 sm:border-r sm:border-zinc-100 sm:dark:border-zinc-800 last:border-0 sm:pr-6 sm:last:pr-0">
      <Icon className={`h-5 w-5 ${accentColor}`} />
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

interface FeaturesSectionProps {
  onQuickAudit: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_URLS = [
  { label: "stripe.com", url: "https://stripe.com" },
  { label: "vercel.com", url: "https://vercel.com" },
  { label: "linear.app", url: "https://linear.app" },
];

export function FeaturesSection({ onQuickAudit, isLoading }: FeaturesSectionProps) {
  return (
    <div id="features" className="flex flex-col gap-10 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          Prueba rápida con un sitio de ejemplo
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example.url}
              onClick={() => onQuickAudit(example.url)}
              disabled={isLoading}
              className="rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
