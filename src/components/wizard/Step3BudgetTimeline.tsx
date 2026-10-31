import React from "react";
import { BUDGET_RANGES, TIMELINES } from "@/lib/constants/services";
import { Calendar, DollarSign } from "lucide-react";

interface Step3BudgetTimelineProps {
  budgetRange: string;
  timeline: string;
  onSelectBudget: (budget: string) => void;
  onSelectTimeline: (timeline: string) => void;
  errors?: {
    budgetRange?: string;
    timeline?: string;
  };
}

export function Step3BudgetTimeline({
  budgetRange,
  timeline,
  onSelectBudget,
  onSelectTimeline,
  errors = {},
}: Step3BudgetTimelineProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 3: Budget Range &amp; Timeline</h2>
        <p className="mt-1 text-sm text-slate-600">
          Help us align on project scale, engineering resources, and delivery expectations.
        </p>
      </div>

      {/* Budget Selection Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Estimated Budget Range <span className="text-red-500">*</span>
          </h3>
        </div>

        {errors.budgetRange && (
          <p className="text-xs text-red-600 font-medium">{errors.budgetRange}</p>
        )}

        <div role="radiogroup" aria-label="Estimated Budget Range" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUDGET_RANGES.map((b) => {
            const isSelected = budgetRange === b.id;

            return (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectBudget(b.id)}
                className={`p-4 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{b.label}</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {b.inrEquivalent}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">{b.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Selection Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Target Delivery Timeline <span className="text-red-500">*</span>
          </h3>
        </div>

        {errors.timeline && (
          <p className="text-xs text-red-600 font-medium">{errors.timeline}</p>
        )}

        <div role="radiogroup" aria-label="Target Delivery Timeline" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIMELINES.map((t) => {
            const isSelected = timeline === t.id;

            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectTimeline(t.id)}
                className={`p-4 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="font-bold text-slate-900 text-sm block mb-1">{t.label}</span>
                <p className="text-xs text-slate-500 leading-normal">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
