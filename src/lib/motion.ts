"use client";

import { useState, useEffect } from "react";
import type { Variants, Transition } from "framer-motion";

const STANDARD_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const BASE_TRANSITION: Transition = {
  duration: 0.5,
  ease: STANDARD_EASE,
};

const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: BASE_TRANSITION },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: SMOOTH_EASE } },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: SMOOTH_EASE } },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: BASE_TRANSITION },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: BASE_TRANSITION },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

export const heroTextReveal: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: SMOOTH_EASE },
  },
};

export const heroSubtitleReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: SMOOTH_EASE, delay: 0.15 },
  },
};

export const heroFormReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: SMOOTH_EASE, delay: 0.3 },
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING_TRANSITION },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: SMOOTH_EASE },
  },
};

export const listItemReveal: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: STANDARD_EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: SPRING_TRANSITION },
};

export const parallaxSlower = { offset: ["start end", "end start"] as const };
export const PARALLAX_Y_RANGE_SUBTLE: number[] = [0, -30];
export const PARALLAX_Y_RANGE_MEDIUM: number[] = [0, -50];

export function useMotionSafe(): boolean {
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setMotionAllowed(false);
    }

    function handleChange(event: MediaQueryListEvent) {
      setMotionAllowed(!event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return motionAllowed;
}

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export function getVariants(motionSafe: boolean, fullVariants: Variants): Variants {
  if (motionSafe) return fullVariants;
  return reducedMotionVariants;
}

export function getStaggerVariants(motionSafe: boolean, fullVariants: Variants): Variants {
  if (motionSafe) return fullVariants;
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15, staggerChildren: 0 } },
  };
}
