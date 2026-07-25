"use client";

import { HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt } from "react-icons/hi2";

interface FeatureCardProps {
  icon: typeof HiCodeBracketSquare;
  title: string;
  description: string;
  accentColor: string;
  iconBgClass: string;
}

const FEATURES: FeatureCardProps[] = [
  {
    icon: HiCodeBracketSquare,
    title: "Datos estructurados",
    description: "Verifica si tu sitio tiene schema markup que identifique quién eres ante buscadores e IA.",
    accentColor: "text-violet-600 dark:text-violet-400",
    iconBgClass: "bg-violet-100 dark:bg-violet-900/40",
  },
  {
    icon: HiUser,
    title: "Consistencia de identidad",
    description: "Compara tu nombre y perfiles entre fuentes para confirmar que te reconocen como una sola entidad.",
    accentColor: "text-sky-600 dark:text-sky-400",
    iconBgClass: "bg-sky-100 dark:bg-sky-900/40",
  },
  {
    icon: HiShieldCheck,
    title: "Señales de autoridad",
    description: "Detecta enlaces a plataformas profesionales, autoría definida y menciones de logros.",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  {
    icon: HiGlobeAlt,
    title: "Accesibilidad técnica",
    description: "Evalúa si crawlers e IA pueden acceder a tu contenido sin barreras técnicas.",
    accentColor: "text-teal-600 dark:text-teal-400",
    iconBgClass: "bg-teal-100 dark:bg-teal-900/40",
  },
];

function FeatureCard({ icon: Icon, title, description, accentColor, iconBgClass }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start gap-3 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/20 transition-shadow hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass}`}>
        <Icon className={`h-5 w-5 ${accentColor}`} />
      </div>
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
    <div className="flex flex-col gap-10 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-1.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
