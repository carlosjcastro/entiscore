"use client";

import { motion } from "framer-motion";
import { useMotionSafe } from "@/lib/motion";

interface PressableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

const PRESS_SCALE = 0.96;
const PRESS_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 17 };

export function PressableButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ariaLabel,
}: PressableButtonProps) {
  const motionSafe = useMotionSafe();

  if (!motionSafe || disabled) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      whileTap={{ scale: PRESS_SCALE }}
      transition={PRESS_TRANSITION}
    >
      {children}
    </motion.button>
  );
}
