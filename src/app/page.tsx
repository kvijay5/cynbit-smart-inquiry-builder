import React from "react";
import { WizardContainer } from "@/components/wizard/WizardContainer";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50/60 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] text-slate-900">
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <WizardHeader />
        <WizardContainer />

        {/* Evaluation & Security Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Cynbit Technologies &bull; Full Stack Internship Assessment Prototype</span>
          </div>
          <p>
            Powered by Next.js 15 App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL with Row Level Security.
          </p>
        </footer>
      </main>
    </div>
  );
}
