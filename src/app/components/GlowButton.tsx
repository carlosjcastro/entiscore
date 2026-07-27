"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionSafe } from "@/lib/motion";

interface GlowButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const PRESS_SCALE = 0.96;
const PRESS_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 17 };
const MAGNETIC_STRENGTH = 0.15;
const MAGNETIC_SPRING = { stiffness: 200, damping: 15, mass: 0.5 };

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

  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const springX = useSpring(magneticX, MAGNETIC_SPRING);
  const springY = useSpring(magneticY, MAGNETIC_SPRING);

  function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
    if (!containerRef.current || !motionSafe) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    setGlowPosition({ x: relativeX, y: relativeY });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    magneticX.set((relativeX - centerX) * MAGNETIC_STRENGTH);
    magneticY.set((relativeY - centerY) * MAGNETIC_STRENGTH);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    magneticX.set(0);
    magneticY.set(0);
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
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
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
