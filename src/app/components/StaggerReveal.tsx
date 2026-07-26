"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { staggerContainer, getStaggerVariants, useMotionSafe } from "@/lib/motion";

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  containerVariants?: Variants;
  viewportMargin?: string;
  viewportOnce?: boolean;
}

export function StaggerReveal({
  children,
  className,
  containerVariants = staggerContainer,
  viewportMargin = "-40px",
  viewportOnce = true,
}: StaggerRevealProps) {
  const motionSafe = useMotionSafe();
  const activeVariants = getStaggerVariants(motionSafe, containerVariants);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: viewportMargin }}
      variants={activeVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
