import React from "react";
import { Bot, Cloud, Code2, Palette, TrendingUp, CheckCircle2 } from "lucide-react";
import { SERVICE_CATEGORIES, ServiceCategoryOption } from "@/lib/constants/services";

interface Step1ServiceProps {
  selectedCategory: string;
  selectedSubServices: string[];
  onSelectCategory: (categoryId: string) => void;
  onToggleSubService: (subServiceId: string) => void;
  error?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "ai-automation": <Bot className="h-6 w-6 text-blue-600" />,
  "custom-software": <Code2 className="h-6 w-6 text-indigo-600" />,
  "cloud-devops": <Cloud className="h-6 w-6 text-sky-600" />,
  "digital-marketing-seo": <TrendingUp className="h-6 w-6 text-emerald-600" />,
  "ui-ux-design": <Palette className="h-6 w-6 text-purple-600" />,
};

export function Step1Service({
  selectedCategory,
  selectedSubServices,
  onSelectCategory,
  onToggleSubService,
  error,
}: Step1ServiceProps) {
  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 1: Choose Service &amp; Capabilities</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select the primary service category you are interested in, then choose the relevant sub-services.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2"
        >
          <span>{error}</span>
        </div>
      )}

      {/* Category Selection Cards */}
      <div role="radiogroup" aria-label="Service Categories" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICE_CATEGORIES.map((cat: ServiceCategoryOption) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-slate-100">{CATEGORY_ICONS[cat.id] || <Bot className="h-6 w-6" />}</div>
                <div className="flex items-center gap-1.5">
                  {cat.offeringType === "proposed_addition" && (
                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                      Proposed
                    </span>
                  )}
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{cat.name}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cat.shortDescription}</p>
            </button>
          );
        })}
      </div>

      {/* Sub-services Multi-select Section */}
      {activeCategory && (
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Select relevant capabilities under {activeCategory.name}
              </h3>
              <p className="text-xs text-slate-500">Pick one or more that match your project scope.</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {selectedSubServices.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeCategory.subServices.map((sub) => {
              const isChecked = selectedSubServices.includes(sub.id);

              return (
                <label
                  key={sub.id}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? "border-blue-500 bg-blue-50/40 text-blue-900"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSubService(sub.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-900">{sub.label}</span>
                    <span className="text-slate-500 mt-0.5 block leading-normal">{sub.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
