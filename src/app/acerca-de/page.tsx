"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowLeft, HiCodeBracketSquare, HiUser, HiShieldCheck, HiGlobeAlt, HiLightBulb, HiMagnifyingGlass } from "react-icons/hi2";
import { useI18n } from "@/i18n";
import {
  fadeInUp,
  slideInFromLeft,
  slideInFromRight,
  listItemReveal,
  staggerContainer,
  staggerContainerSlow,
  getVariants,
  getStaggerVariants,
  useMotionSafe,
} from "@/lib/motion";
import { ScrollReveal } from "@/app/components/ScrollReveal";

export default function AcercaDePage() {
  const t = useI18n();
  const motionSafe = useMotionSafe();

  const axes = [
    { key: "structuredData", icon: HiCodeBracketSquare, ...t.features.structuredData },
    { key: "identityConsistency", icon: HiUser, ...t.features.identityConsistency },
    { key: "authoritySignals", icon: HiShieldCheck, ...t.features.authoritySignals },
    { key: "technicalAccessibility", icon: HiGlobeAlt, ...t.features.technicalAccessibility },
  ];

  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          className="flex items-center gap-3 mb-12"
          variants={getVariants(motionSafe, fadeInUp)}
          initial="hidden"
          animate="visible"
        >
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">{t.pages.about.title}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.section
            variants={getVariants(motionSafe, slideInFromLeft)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <HiMagnifyingGlass className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{t.pages.about.whatIs}</h2>
            </div>
            <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{t.pages.about.whatIsDescription}</p>

            <motion.div
              className="mt-8"
              variants={getStaggerVariants(motionSafe, staggerContainer)}
              initial="hidden"
              animate="visible"
            >
              {axes.map((axis) => {
                const Icon = axis.icon;
                return (
                  <motion.div
                    key={axis.key}
                    variants={getVariants(motionSafe, listItemReveal)}
                    className="flex gap-3 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  >
                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{axis.title}</h4>
                      <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">{axis.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          <motion.div
            className="flex flex-col gap-10"
            variants={getStaggerVariants(motionSafe, staggerContainerSlow)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.section variants={getVariants(motionSafe, slideInFromRight)}>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">{t.pages.about.audience}</h2>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{t.pages.about.audienceDescription}</p>
            </motion.section>
            <motion.section variants={getVariants(motionSafe, slideInFromRight)}>
              <div className="flex items-center gap-3 mb-3">
                <HiLightBulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{t.pages.about.problem}</h2>
              </div>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{t.pages.about.problemDescription}</p>
            </motion.section>
            <motion.section variants={getVariants(motionSafe, slideInFromRight)}>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">{t.pages.about.purpose}</h2>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{t.pages.about.purposeDescription}</p>
            </motion.section>
          </motion.div>
        </div>

        <ScrollReveal variants={fadeInUp} className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-4">
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{t.pages.about.builtWith}</p>
          <div className="flex items-center gap-8">
            <a
              href="https://github.com/carlosjcastro"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center"
            >
              <Image
                src="/logo/entiscore.png"
                alt="Entiscore"
                width={40}
                height={40}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 dark:bg-zinc-700 px-2 py-1 text-[11px] text-zinc-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t.pages.about.viewRepo}
              </span>
            </a>

            <span className="text-zinc-300 dark:text-zinc-700">·</span>

            <a
              href="https://kiro.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center"
            >
              <Image
                src="/logo/kiro.png"
                alt="Kiro"
                width={40}
                height={40}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 dark:bg-zinc-700 px-2 py-1 text-[11px] text-zinc-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Kiro
              </span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
