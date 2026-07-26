"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

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
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-[200] pointer-events-none">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded bg-zinc-800 dark:bg-zinc-200 px-4 py-2.5 text-[13px] font-medium text-white dark:text-zinc-900 shadow-lg">
            {activeToast}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
