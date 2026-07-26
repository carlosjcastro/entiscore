"use client";

import { useEffect, useState } from "react";

const DOT_COUNT = 5;
const CYCLE_DURATION_MS = 1200;
const DELAY_PER_DOT_MS = CYCLE_DURATION_MS / DOT_COUNT;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: DOT_COUNT }).map((_, index) => (
          <div
            key={index}
            className="h-2 w-2 rounded-full bg-indigo-500"
            style={{
              animation: `dotPulse ${CYCLE_DURATION_MS}ms ease-in-out infinite`,
              animationDelay: `${index * DELAY_PER_DOT_MS}ms`,
            }}
          />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.5); }
        }
      `}} />
    </div>
  );
}
