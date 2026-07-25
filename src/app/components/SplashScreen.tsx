"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 800);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1300);

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
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white animate-pulse">
          Entiscore
        </h1>
        <div className="h-0.5 w-16 rounded-full bg-indigo-500/60 animate-pulse" />
      </div>
    </div>
  );
}
