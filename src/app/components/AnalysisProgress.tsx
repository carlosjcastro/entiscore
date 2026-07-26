"use client";

import { useEffect, useState, useRef } from "react";
import { HiCheck } from "react-icons/hi2";
import { useI18n } from "@/i18n";

interface AnalysisStep {
  label: string;
  durationMs: number;
}

const STEP_DURATIONS = [2000, 2500, 2000, 3000, 2500, 2000];

type StepStatus = "pending" | "active" | "completed";

interface AnalysisProgressProps {
  isComplete: boolean;
}

export function AnalysisProgress({ isComplete }: AnalysisProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());
  const t = useI18n();

  const analysisSteps: AnalysisStep[] = t.progress.steps.map((label, index) => ({
    label,
    durationMs: STEP_DURATIONS[index] ?? 2000,
  }));

  useEffect(() => {
    startTimeRef.current = Date.now();
    advanceToNextStep(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isComplete) {
      setCurrentStepIndex(analysisSteps.length);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isComplete, analysisSteps.length]);

  function advanceToNextStep(stepIndex: number) {
    if (stepIndex >= analysisSteps.length - 1) return;

    const step = analysisSteps[stepIndex];
    if (!step) return;

    timerRef.current = setTimeout(() => {
      setCurrentStepIndex(stepIndex + 1);
      advanceToNextStep(stepIndex + 1);
    }, step.durationMs);
  }

  function getStepStatus(index: number): StepStatus {
    if (isComplete) return "completed";
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "active";
    return "pending";
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12 max-w-sm mx-auto">
      <div className="flex flex-col gap-1 w-full">
        {analysisSteps.map((step, index) => (
          <StepRow key={step.label} label={step.label} status={getStepStatus(index)} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ label, status }: { label: string; status: StepStatus }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <StepIndicator status={status} />
      <span
        className={`text-[13px] transition-colors duration-300 ${
          status === "completed"
            ? "text-zinc-800 dark:text-zinc-200"
            : status === "active"
              ? "text-indigo-600 dark:text-indigo-400 font-medium"
              : "text-zinc-400 dark:text-zinc-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
        <HiCheck className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
    </div>
  );
}
