import React from "react";
import { Check } from "lucide-react";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

const STEPS = [
  { step: 1, label: "Services" },
  { step: 2, label: "Scope" },
  { step: 3, label: "Budget & Timeline" },
  { step: 4, label: "Contact" },
  { step: 5, label: "Review" },
  { step: 6, label: "Confirmation" },
];

export function StepProgressBar({ currentStep, onStepClick, completedSteps = [] }: StepProgressBarProps) {
  const isFinalStep = currentStep === 6;

  return (
    <nav aria-label="Inquiry Progress" className="mb-8">
      {/* Mobile progress display */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>
            {isFinalStep ? "Submission Complete" : `Step ${currentStep} of 5: ${STEPS[currentStep - 1]?.label}`}
          </span>
          <span className="text-blue-600 font-bold">
            {isFinalStep ? "100%" : `${Math.round(((currentStep - 1) / 5) * 100)}%`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${isFinalStep ? 100 : ((currentStep - 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop / Tablet breadcrumbs */}
      <ol className="hidden sm:grid sm:grid-cols-6 gap-2">
        {STEPS.map(({ step, label }) => {
          const isCompleted = step < currentStep || (isFinalStep && step === 6);
          const isCurrent = step === currentStep;
          const isClickable = onStepClick && completedSteps.includes(step) && !isFinalStep && step < currentStep;

          return (
            <li key={step} className="relative">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step)}
                className={`group flex w-full flex-col items-center text-center transition-all ${
                  isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-blue-600 text-white shadow-sm"
                      : isCurrent
                      ? "border-2 border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100"
                      : "border border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {isCompleted && step !== 6 ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isCurrent
                      ? "font-bold text-blue-700"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
