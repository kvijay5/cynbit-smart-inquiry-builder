import React from "react";
import { Sparkles } from "lucide-react";

export function WizardHeader() {
  return (
    <header className="mb-8 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cynbit Technologies &bull; Assessment Prototype</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Smart Project Inquiry Builder
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us about your digital vision. We will match you with the optimal AI, software, or cloud architecture.
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end text-xs text-slate-500">
          <span className="font-medium text-slate-700">Digital Solutions &amp; Engineering</span>
          <span>Jaipur, India &bull; Global Operations</span>
        </div>
      </div>
    </header>
  );
}
