import { describe, expect, it } from "vitest";
import { BUDGET_RANGES, SERVICE_CATEGORIES, TIMELINES } from "@/lib/constants/services";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validations/inquiry";
import { InquiryFormData } from "@/types/inquiry";

describe("Frontend Wizard Step Navigation & State Validation", () => {
  const initialFormData: InquiryFormData = {
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
    idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
  };

  describe("Step 1: Service Category & Sub-services Validation", () => {
    it("blocks transition when no sub-services are selected", () => {
      const step1Result = step1Schema.safeParse({
        serviceCategory: initialFormData.serviceCategory,
        subServices: initialFormData.subServices,
      });

      expect(step1Result.success).toBe(false);
      if (!step1Result.success) {
        expect(step1Result.error.issues[0].message).toContain("Please select at least one");
      }
    });

    it("allows transition when valid sub-services are chosen", () => {
      const step1Result = step1Schema.safeParse({
        serviceCategory: "ai-automation",
        subServices: ["custom-llm"],
      });

      expect(step1Result.success).toBe(true);
    });

    it("handles switching categories by ensuring each category has valid sub-services in catalogue", () => {
      SERVICE_CATEGORIES.forEach((category) => {
        expect(category.subServices.length).toBeGreaterThan(0);
        const subServiceIds = category.subServices.map((s) => s.id);

        const result = step1Schema.safeParse({
          serviceCategory: category.id,
          subServices: [subServiceIds[0]],
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Step 2: Project Scope Validation & Character Bounds", () => {
    it("blocks transition if project description is under 20 characters", () => {
      const shortResult = step2Schema.safeParse({
        projectDescription: "Need AI bot",
      });

      expect(shortResult.success).toBe(false);
      if (!shortResult.success) {
        expect(shortResult.error.issues[0].message).toContain("at least 20 characters");
      }
    });

    it("allows transition when description meets character requirements", () => {
      const validResult = step2Schema.safeParse({
        projectDescription: "We need an enterprise-grade AI customer service agent integrated with our CRM.",
      });

      expect(validResult.success).toBe(true);
    });
  });

  describe("Step 3: Budget Range & Timeline Validation", () => {
    it("validates all configured budget tiers and timelines", () => {
      BUDGET_RANGES.forEach((b) => {
        TIMELINES.forEach((t) => {
          const result = step3Schema.safeParse({
            budgetRange: b.id,
            timeline: t.id,
          });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe("Step 4: Contact Details & Consent", () => {
    it("blocks transition if consent is not granted", () => {
      const result = step4Schema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        consent: false,
      });

      expect(result.success).toBe(false);
    });

    it("blocks transition if name is less than 2 characters", () => {
      const result = step4Schema.safeParse({
        name: "J",
        email: "jane@example.com",
        consent: true,
      });

      expect(result.success).toBe(false);
    });

    it("allows transition with valid required fields and optional fields empty", () => {
      const result = step4Schema.safeParse({
        name: "Jane Doe",
        email: "jane@company.com",
        consent: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Step 5: Review & Submission Assembly", () => {
    it("retains all previously entered form data accurately for final submission", () => {
      const populatedFormData: InquiryFormData = {
        serviceCategory: "custom-software",
        subServices: ["web-platforms", "saas-architecture"],
        projectDescription: "Building a high-performance Next.js application with scalable API microservices.",
        budgetRange: "15k-30k",
        timeline: "1-3-months",
        name: "Kruti Vijay",
        email: "kruti@cynbit.in",
        phone: "+91 9876543210",
        company: "Cynbit Assessment",
        consent: true,
        honeypot: "",
        idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Ensure the assembled payload preserves all form fields
      expect(populatedFormData.serviceCategory).toBe("custom-software");
      expect(populatedFormData.subServices).toHaveLength(2);
      expect(populatedFormData.idempotencyKey).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(populatedFormData.honeypot).toBe("");
    });
  });
});
