import React from "react";
import { BUDGET_RANGES, SERVICE_CATEGORIES, TIMELINES } from "@/lib/constants/services";
import { InquiryFormData } from "@/types/inquiry";
import { AlertCircle, CheckCircle, Edit3, Key, Loader2, Send } from "lucide-react";

interface Step5ReviewProps {
  formData: InquiryFormData;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submissionError?: string | null;
}

export function Step5Review({
  formData,
  onEditStep,
  onSubmit,
  isSubmitting,
  submissionError,
}: Step5ReviewProps) {
  const category = SERVICE_CATEGORIES.find((c) => c.id === formData.serviceCategory);
  const selectedSubServiceLabels = category
    ? category.subServices
        .filter((sub) => formData.subServices.includes(sub.id))
        .map((sub) => sub.label)
    : [];

  const budget = BUDGET_RANGES.find((b) => b.id === formData.budgetRange);
  const timeline = TIMELINES.find((t) => t.id === formData.timeline);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 5: Review &amp; Confirm Inquiry</h2>
        <p className="mt-1 text-sm text-slate-600">
          Please review your project details before submitting. You can click Edit on any section to make changes.
        </p>
      </div>

      {submissionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Submission Error</span>
            <span>{submissionError}</span>
          </div>
        </div>
      )}

      {/* Review Sections */}
      <div className="space-y-4">
        {/* 1. Services */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Selected Capabilities
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="mt-3">
            <span className="font-bold text-sm text-slate-900 block">{category?.name || formData.serviceCategory}</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedSubServiceLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Description */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Project Scope &amp; Overview
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {formData.projectDescription}
          </p>
        </div>

        {/* 3. Budget & Timeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Budget &amp; Timeline
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Estimated Budget:</span>
              <span className="font-bold text-slate-900">{budget?.label}</span>
              <span className="text-xs text-slate-500 block">({budget?.inrEquivalent})</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Target Timeline:</span>
              <span className="font-bold text-slate-900">{timeline?.label}</span>
            </div>
          </div>
        </div>

        {/* 4. Contact Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Contact Information
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-slate-500">Name:</span>
              <span className="font-semibold text-slate-900 block">{formData.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Email:</span>
              <span className="font-semibold text-slate-900 block">{formData.email}</span>
            </div>
            {formData.phone && (
              <div>
                <span className="text-xs text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-900 block">{formData.phone}</span>
              </div>
            )}
            {formData.company && (
              <div>
                <span className="text-xs text-slate-500">Company:</span>
                <span className="font-semibold text-slate-900 block">{formData.company}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Idempotency Key Badge */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 border border-slate-200">
        <div className="flex items-center gap-1.5">
          <Key className="h-3.5 w-3.5 text-blue-600" />
          <span>Idempotency Protection Active:</span>
        </div>
        <span className="font-mono text-slate-600 truncate max-w-[200px]" title={formData.idempotencyKey}>
          {formData.idempotencyKey}
        </span>
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 px-6 font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Inquiry to Cynbit Architecture Team...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Project Inquiry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
