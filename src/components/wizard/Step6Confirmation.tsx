import React, { useState } from "react";
import { InquirySubmissionResult } from "@/types/inquiry";
import { Check, CheckCircle2, Clock, Copy, RefreshCw, ShieldCheck } from "lucide-react";

interface Step6ConfirmationProps {
  result: InquirySubmissionResult;
  onReset: () => void;
}

export function Step6Confirmation({ result, onReset }: Step6ConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is not available
      setCopied(false);
    }
  };

  return (
    <div className="text-center py-6 sm:py-8 space-y-6">
      {/* Success Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Inquiry Received!</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Thank you for reaching out to Cynbit Technologies. Your project inquiry has been logged securely in our system.
        </p>
      </div>

      {/* Reference Number Card */}
      <div className="max-w-md mx-auto rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
          Your Unique Reference Code
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-wider">
            {result.reference}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-xs border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Copy reference code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-blue-800/80 pt-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Inquiry Status: <strong className="capitalize">{result.status}</strong> &bull; Verified Submission</span>
        </div>
      </div>

      {/* What to expect next */}
      <div className="max-w-md mx-auto text-left rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>What happens next?</span>
        </h3>
        <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
          <li>
            <strong className="text-slate-800">Architectural Review:</strong> Our engineering leads evaluate your scope, capabilities, and stack requirements.
          </li>
          <li>
            <strong className="text-slate-800">Direct Consultation:</strong> We follow up via your provided email with an initial feasibility roadmap and delivery timeline.
          </li>
          <li>
            <strong className="text-slate-800">Inquiry Tracking:</strong> Keep your reference code handy if you connect with our team directly.
          </li>
        </ol>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Submit Another Inquiry</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
        <span>Protected by Server-Side Validation &amp; Idempotency Controls</span>
      </div>
    </div>
  );
}
