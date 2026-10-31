import React from "react";
import { Building2, Mail, Phone, ShieldCheck, User } from "lucide-react";

interface Step4ContactProps {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  consent: boolean;
  honeypot?: string;
  onChange: (field: string, value: string | boolean) => void;
  errors?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    consent?: string;
  };
}

export function Step4Contact({
  name,
  email,
  phone = "",
  company = "",
  consent,
  honeypot = "",
  onChange,
  errors = {},
}: Step4ContactProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 4: Contact Details &amp; Consent</h2>
        <p className="mt-1 text-sm text-slate-600">
          Where should our engineering architecture team send your project roadmap and inquiry reference?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-slate-800 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="E.g., Jane Doe"
              className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1.5">
            Work / Primary Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="name@company.com"
              className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
        </div>

        {/* Phone Number (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-slate-800 mb-1.5">
            Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+91 98765 43210 or +1 (555) 019-2834"
              className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>}
        </div>

        {/* Company Name (Optional) */}
        <div>
          <label htmlFor="company" className="block text-xs font-bold text-slate-800 mb-1.5">
            Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="h-4 w-4" />
            </div>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => onChange("company", e.target.value)}
              placeholder="E.g., Acme Technologies Inc."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Honeypot Field: visually hidden from real users */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
        }}
      >
        <label htmlFor="inquiry_bot_trap">Do not fill this field</label>
        <input
          id="inquiry_bot_trap"
          name="inquiry_bot_trap"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => onChange("honeypot", e.target.value)}
        />
      </div>

      {/* Consent Checkbox */}
      <div className="pt-4 border-t border-slate-200">
        <label
          htmlFor="consent"
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
            consent
              ? "border-blue-300 bg-blue-50/40 text-blue-900"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
          }`}
        >
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => onChange("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block text-slate-900">
              Communication &amp; Project Privacy Consent <span className="text-red-500">*</span>
            </span>
            <span className="text-slate-500 mt-0.5 block">
              I agree to allow Cynbit Technologies to process this inquiry data strictly for project evaluation,
              architecture scoping, and direct communication. Your information is never sold or shared.
            </span>
          </div>
        </label>
        {errors.consent && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.consent}</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Enterprise privacy: Your contact details are stored in a private database with Row Level Security.</span>
      </div>
    </div>
  );
}
