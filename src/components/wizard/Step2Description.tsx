import React from "react";
import { FORM_LIMITS } from "@/lib/constants/services";
import { HelpCircle } from "lucide-react";

interface Step2DescriptionProps {
  projectDescription: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Step2Description({
  projectDescription,
  onChange,
  error,
}: Step2DescriptionProps) {
  const currentLength = projectDescription.trim().length;
  const isTooShort = currentLength < FORM_LIMITS.MIN_DESCRIPTION_LENGTH;
  const isTooLong = currentLength > FORM_LIMITS.MAX_DESCRIPTION_LENGTH;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 2: Describe Your Project Scope</h2>
        <p className="mt-1 text-sm text-slate-600">
          Provide an overview of your requirements, business objectives, and any specific technical constraints.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Helpful Guidance Callout */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-blue-950">
          <HelpCircle className="h-4 w-4 text-blue-600" />
          <span>Tips for a helpful inquiry brief:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-blue-800 pl-1">
          <li>What problem are you seeking to solve?</li>
          <li>Are you building a new platform from scratch or modernizing an existing system?</li>
          <li>Do you require AI autonomous workflows, LLM fine-tuning, or specific API integrations?</li>
        </ul>
      </div>

      {/* Textarea Input */}
      <div>
        <label htmlFor="projectDescription" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Project Overview &amp; Specifications <span className="text-red-500">*</span>
        </label>
        <textarea
          id="projectDescription"
          rows={6}
          value={projectDescription}
          onChange={(e) => onChange(e.target.value)}
          placeholder="E.g., We are developing a multi-tenant B2B SaaS platform that requires autonomous AI agents to automate customer review sentiment analysis and sync data with our CRM..."
          className={`w-full rounded-xl border p-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={
              isTooShort
                ? "text-amber-600 font-medium"
                : isTooLong
                ? "text-red-600 font-medium"
                : "text-slate-500"
            }
          >
            {isTooShort
              ? `Minimum ${FORM_LIMITS.MIN_DESCRIPTION_LENGTH} characters required (${FORM_LIMITS.MIN_DESCRIPTION_LENGTH - currentLength} more needed)`
              : isTooLong
              ? `Maximum ${FORM_LIMITS.MAX_DESCRIPTION_LENGTH} characters exceeded`
              : "Looks good!"}
          </span>
          <span className="text-slate-400 font-mono">
            {currentLength} / {FORM_LIMITS.MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
