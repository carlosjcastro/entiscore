"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastContextValue {
  showToast: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TOAST_DURATION_MS = 2500;

const TOAST_ANIMATION = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
};

const TOAST_TRANSITION = {
  type: "spring" as const,
  stiffness: 350,
  damping: 22,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setActiveToast(text);
    timerRef.current = setTimeout(() => {
      setActiveToast(null);
      timerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] pointer-events-none">
        <AnimatePresence mode="wait">
          {activeToast && (
            <motion.div
              key={activeToast}
              initial={TOAST_ANIMATION.initial}
              animate={TOAST_ANIMATION.animate}
              exit={TOAST_ANIMATION.exit}
              transition={TOAST_TRANSITION}
              className="rounded bg-zinc-800 dark:bg-zinc-200 px-4 py-2.5 text-[13px] font-medium text-white dark:text-zinc-900 shadow-lg"
            >
              {activeToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
