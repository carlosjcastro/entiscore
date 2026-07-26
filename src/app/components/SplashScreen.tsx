"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

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
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="animate-[spin_8s_linear_infinite]"
            opacity="0.6"
          />
          <polygon
            points="50,20 80,35 80,65 50,80 20,65 20,35"
            fill="none"
            stroke="#818cf8"
            strokeWidth="1"
            className="animate-[spin_6s_linear_infinite_reverse]"
            opacity="0.4"
          />
          <line
            x1="10"
            y1="50"
            x2="90"
            y2="50"
            stroke="#a5b4fc"
            strokeWidth="0.8"
            opacity="0.8"
            className="animate-[scanPulse_1.5s_ease-in-out_infinite]"
          />
        </svg>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scanPulse {
            0%, 100% { opacity: 0.3; transform: translateY(-15px); }
            50% { opacity: 0.9; transform: translateY(15px); }
          }
        `}} />
      </div>
    </div>
  );
}
