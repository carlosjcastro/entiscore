"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt } from "react-icons/hi2";
import { useI18n } from "@/i18n";

const STAGGER_DELAY_MS = 100;

interface FeatureCardProps {
  icon: typeof HiCodeBracketSquare;
  title: string;
  description: string;
  index: number;
  shouldAnimate: boolean;
}

function FeatureCard({ icon: Icon, title, description, index, shouldAnimate }: FeatureCardProps) {
  return (
    <motion.div
      initial={false}
      animate={
        shouldAnimate
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 20, filter: "blur(6px)" }
      }
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: index * (STAGGER_DELAY_MS / 1000) }}
      className="flex flex-col gap-2 py-4 border-b border-zinc-100 dark:border-zinc-800 sm:border-b-0 sm:border-r sm:border-zinc-100 sm:dark:border-zinc-800 last:border-0 sm:pr-6 sm:last:pr-0"
    >
      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
    </motion.div>
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
  const t = useI18n();
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setHasEnteredViewport(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const FEATURE_KEYS = ["structuredData", "identityConsistency", "authoritySignals", "technicalAccessibility"] as const;

  const features = [
    { key: FEATURE_KEYS[0], icon: HiCodeBracketSquare, ...t.features.structuredData },
    { key: FEATURE_KEYS[1], icon: HiUser, ...t.features.identityConsistency },
    { key: FEATURE_KEYS[2], icon: HiShieldCheck, ...t.features.authoritySignals },
    { key: FEATURE_KEYS[3], icon: HiGlobeAlt, ...t.features.technicalAccessibility },
  ];

  return (
    <div id="features" className="flex flex-col gap-10 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.key}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
            shouldAnimate={hasEnteredViewport}
          />
        ))}
      </div>

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={false}
        animate={hasEnteredViewport ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
      >
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          {t.features.quickTest}
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
      </motion.div>
    </div>
  );
}
