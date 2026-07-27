"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

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
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: viewportMargin }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
