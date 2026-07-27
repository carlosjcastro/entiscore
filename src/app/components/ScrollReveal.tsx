"use client";

import { motion } from "framer-motion";
import type { Variants, HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  viewportMargin?: string;
  viewportOnce?: boolean;
}

export function ScrollReveal({
  children,
  variants = fadeInUp,
  className,
  viewportMargin = "-60px",
  viewportOnce = true,
  ...motionProps
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: viewportMargin }}
      variants={variants}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
