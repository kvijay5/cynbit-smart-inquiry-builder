"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validations/inquiry";
import { ApiResponse, InquiryFormData, InquirySubmissionResult } from "@/types/inquiry";
import { StepProgressBar } from "./StepProgressBar";
import { Step1Service } from "./Step1Service";
import { Step2Description } from "./Step2Description";
import { Step3BudgetTimeline } from "./Step3BudgetTimeline";
import { Step4Contact } from "./Step4Contact";
import { Step5Review } from "./Step5Review";
import { Step6Confirmation } from "./Step6Confirmation";

const INITIAL_FORM_DATA: InquiryFormData = {
  serviceCategory: "ai-automation",
  subServices: [],
  projectDescription: "",
  budgetRange: "15k-30k",
  timeline: "1-3-months",
  name: "",
  email: "",
  phone: "",
  company: "",
  consent: false,
  honeypot: "",
  idempotencyKey: "",
};

export function WizardContainer() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<InquiryFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<InquirySubmissionResult | null>(null);

  // Initialize unique idempotency key on mount (client-side only)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      idempotencyKey: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }),
    }));
  }, []);

  // Step 1 Handlers
  const handleSelectCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCategory: categoryId,
      subServices: [], // Reset sub-services when switching category
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.serviceCategory;
      delete next.subServices;
      return next;
    });
  };

  const handleToggleSubService = (subServiceId: string) => {
    setFormData((prev) => {
      const exists = prev.subServices.includes(subServiceId);
      const nextSubServices = exists
        ? prev.subServices.filter((id) => id !== subServiceId)
        : [...prev.subServices, subServiceId];
      return { ...prev, subServices: nextSubServices };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.subServices;
      return next;
    });
  };

  // Step 2 Handler
  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, projectDescription: value }));
    if (errors.projectDescription) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.projectDescription;
        return next;
      });
    }
  };

  // Step 3 Handlers
  const handleSelectBudget = (budget: string) => {
    setFormData((prev) => ({ ...prev, budgetRange: budget }));
    if (errors.budgetRange) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.budgetRange;
        return next;
      });
    }
  };

  const handleSelectTimeline = (timelineVal: string) => {
    setFormData((prev) => ({ ...prev, timeline: timelineVal }));
    if (errors.timeline) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.timeline;
        return next;
      });
    }
  };

  // Step 4 Handler
  const handleContactChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step Validation using Zod
  const validateCurrentStep = (): boolean => {
    setErrors({});
    let result;

    if (currentStep === 1) {
      result = step1Schema.safeParse({
        serviceCategory: formData.serviceCategory,
        subServices: formData.subServices,
      });
    } else if (currentStep === 2) {
      result = step2Schema.safeParse({
        projectDescription: formData.projectDescription,
      });
    } else if (currentStep === 3) {
      result = step3Schema.safeParse({
        budgetRange: formData.budgetRange,
        timeline: formData.timeline,
      });
    } else if (currentStep === 4) {
      result = step4Schema.safeParse({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        consent: formData.consent,
        honeypot: formData.honeypot || undefined,
      });
    } else {
      return true;
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateCurrentStep()) return;

    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    setCurrentStep((prev) => Math.min(prev + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors({});
    setSubmissionError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJumpToStep = (stepNumber: number) => {
    setErrors({});
    setSubmissionError(null);
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission to POST /api/inquiries
  const handleSubmit = async () => {
    // Guard against duplicate concurrent clicks
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        idempotencyKey: formData.idempotencyKey,
        serviceCategory: formData.serviceCategory,
        subServices: formData.subServices,
        projectDescription: formData.projectDescription,
        budgetRange: formData.budgetRange,
        timeline: formData.timeline,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        consent: formData.consent,
        honeypot: formData.honeypot || undefined,
        inquiry_bot_trap: formData.honeypot || undefined,
      };

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<InquirySubmissionResult> = await response.json();

      if (!response.ok || !json.success) {
        if (!json.success && json.error?.message) {
          setSubmissionError(json.error.message);
        } else {
          setSubmissionError("Failed to submit inquiry. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      // Success: advance to confirmation screen
      setSubmissionResult(json.data);
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmissionError("Network error. Please verify your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to start a new inquiry
  const handleReset = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      idempotencyKey: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    });
    setCompletedSteps([]);
    setErrors({});
    setSubmissionError(null);
    setSubmissionResult(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm">
      <StepProgressBar
        currentStep={currentStep}
        onStepClick={handleJumpToStep}
        completedSteps={completedSteps}
      />

      {/* Wizard Step Render Area */}
      <div className="min-h-[380px]">
        {currentStep === 1 && (
          <Step1Service
            selectedCategory={formData.serviceCategory}
            selectedSubServices={formData.subServices}
            onSelectCategory={handleSelectCategory}
            onToggleSubService={handleToggleSubService}
            error={errors.subServices || errors.serviceCategory}
          />
        )}

        {currentStep === 2 && (
          <Step2Description
            projectDescription={formData.projectDescription}
            onChange={handleDescriptionChange}
            error={errors.projectDescription}
          />
        )}

        {currentStep === 3 && (
          <Step3BudgetTimeline
            budgetRange={formData.budgetRange}
            timeline={formData.timeline}
            onSelectBudget={handleSelectBudget}
            onSelectTimeline={handleSelectTimeline}
            errors={{
              budgetRange: errors.budgetRange,
              timeline: errors.timeline,
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4Contact
            name={formData.name}
            email={formData.email}
            phone={formData.phone}
            company={formData.company}
            consent={formData.consent}
            honeypot={formData.honeypot}
            onChange={handleContactChange}
            errors={{
              name: errors.name,
              email: errors.email,
              phone: errors.phone,
              consent: errors.consent,
            }}
          />
        )}

        {currentStep === 5 && (
          <Step5Review
            formData={formData}
            onEditStep={handleJumpToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
          />
        )}

        {currentStep === 6 && submissionResult && (
          <Step6Confirmation result={submissionResult} onReset={handleReset} />
        )}
      </div>

      {/* Navigation Buttons (Steps 1 through 4) */}
      {currentStep < 5 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold transition-all ${
              currentStep === 1
                ? "invisible opacity-0"
                : "text-slate-700 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation on Step 5 (Review) */}
      {currentStep === 5 && (
        <div className="mt-6 flex items-center justify-start border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Contact Info</span>
          </button>
        </div>
      )}
    </div>
  );
}
