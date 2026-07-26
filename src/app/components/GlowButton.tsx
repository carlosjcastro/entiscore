"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMotionSafe } from "@/lib/motion";

interface GlowButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const PRESS_SCALE = 0.96;
const PRESS_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 17 };

export function GlowButton({
  children,
  disabled = false,
  className = "",
  type = "button",
}: GlowButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const motionSafe = useMotionSafe();

  function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
    if (!containerRef.current || !motionSafe) return;
    const rect = containerRef.current.getBoundingClientRect();
    setGlowPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  if (!motionSafe) {
    return (
      <button type={type} disabled={disabled} className={className}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={containerRef}
      type={type}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={disabled ? undefined : { scale: PRESS_SCALE }}
      transition={PRESS_TRANSITION}
    >
      {isHovered && !disabled && (
        <span
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px circle at ${glowPosition.x}px ${glowPosition.y}px, rgba(165, 140, 255, 0.4), transparent 70%)`,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
