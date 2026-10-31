import { describe, expect, it } from "vitest";
import {
  inquirySubmissionSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validations/inquiry";

describe("Inquiry Zod Validation Schemas", () => {
  describe("Step 1: Service Category & Sub-services", () => {
    it("accepts valid category and corresponding sub-services", () => {
      const valid = {
        serviceCategory: "ai-automation",
        subServices: ["custom-llm", "autonomous-agents"],
      };
      const result = step1Schema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts digital marketing, SEO and CRM automation offerings", () => {
      const valid = {
        serviceCategory: "digital-marketing-seo",
        subServices: ["technical-seo", "crm-automation", "funnel-optimization"],
      };
      const result = step1Schema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects an invalid service category", () => {
      const invalid = {
        serviceCategory: "crypto-mining",
        subServices: ["custom-llm"],
      };
      const result = step1Schema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects empty sub-services list", () => {
      const invalid = {
        serviceCategory: "custom-software",
        subServices: [],
      };
      const result = step1Schema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Please select at least one");
      }
    });

    it("rejects sub-services that do not belong to the selected category", () => {
      const mismatched = {
        serviceCategory: "ai-automation",
        // 'devops-cicd' belongs to 'cloud-devops', not 'ai-automation'
        subServices: ["custom-llm", "devops-cicd"],
      };
      const result = step1Schema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("do not belong to AI Automation");
      }
    });
  });

  describe("Step 2: Project Scope & Description", () => {
    it("accepts a description meeting length requirements", () => {
      const valid = {
        projectDescription: "We need an enterprise-grade AI customer service agent integrated with our CRM.",
      };
      const result = step2Schema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects descriptions shorter than 20 characters", () => {
      const tooShort = {
        projectDescription: "Build app",
      };
      const result = step2Schema.safeParse(tooShort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 20 characters");
      }
    });

    it("rejects descriptions exceeding 2000 characters", () => {
      const tooLong = {
        projectDescription: "a".repeat(2001),
      };
      const result = step2Schema.safeParse(tooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 2000");
      }
    });
  });

  describe("Step 3: Budget Range & Timeline", () => {
    it("accepts valid budget and timeline options", () => {
      const valid = {
        budgetRange: "15k-30k",
        timeline: "1-3-months",
      };
      const result = step3Schema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts all configured budget ranges without currency ambiguity", () => {
      const ranges = ["under-5k", "5k-15k", "15k-30k", "30k-plus"];
      for (const budgetRange of ranges) {
        const result = step3Schema.safeParse({ budgetRange, timeline: "urgent" });
        expect(result.success).toBe(true);
      }
    });

    it("rejects an invalid budget range", () => {
      const invalid = {
        budgetRange: "free-tier",
        timeline: "1-3-months",
      };
      const result = step3Schema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects an invalid timeline", () => {
      const invalid = {
        budgetRange: "under-5k",
        timeline: "yesterday",
      };
      const result = step3Schema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Step 4: Contact Details & Consent", () => {
    it("accepts valid contact information with consent", () => {
      const valid = {
        name: "Jane Doe",
        email: "JANE.DOE@COMPANY.COM",
        phone: "+1 (555) 019-2834",
        company: "Acme Corp",
        consent: true,
      };
      const result = step4Schema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("jane.doe@company.com"); // Normalized to lowercase
      }
    });

    it("rejects missing or false consent", () => {
      const noConsent = {
        name: "Jane Doe",
        email: "jane@example.com",
        consent: false,
      };
      const result = step4Schema.safeParse(noConsent);
      expect(result.success).toBe(false);
    });

    it("rejects names shorter than 2 characters", () => {
      const shortName = {
        name: "J",
        email: "jane@example.com",
        consent: true,
      };
      const result = step4Schema.safeParse(shortName);
      expect(result.success).toBe(false);
    });

    it("rejects malformed email addresses", () => {
      const invalidEmail = {
        name: "Jane Doe",
        email: "not-an-email",
        consent: true,
      };
      const result = step4Schema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });
  });

  describe("Full Inquiry Submission Schema (API level)", () => {
    const validFullPayload = {
      idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
      serviceCategory: "ai-automation",
      subServices: ["custom-llm"],
      projectDescription: "Deploying an autonomous customer support agent for our SaaS platform.",
      budgetRange: "15k-30k",
      timeline: "1-3-months",
      name: "Kruti Vijay",
      email: "Kruti.Vijay@Example.com",
      phone: "+91 9876543210",
      company: "AI Labs",
      consent: true,
      honeypot: "",
    };

    it("successfully validates full payload with UUID idempotency key", () => {
      const result = inquirySubmissionSchema.safeParse(validFullPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("kruti.vijay@example.com");
      }
    });

    it("rejects if idempotency key is not a valid UUIDv4", () => {
      const invalidKey = {
        ...validFullPayload,
        idempotencyKey: "not-a-uuid",
      };
      const result = inquirySubmissionSchema.safeParse(invalidKey);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("UUID");
      }
    });

    it("triggers spam rejection when honeypot field is filled", () => {
      const spamPayload = {
        ...validFullPayload,
        honeypot: "http://buy-cheap-stuff.xyz",
      };
      const result = inquirySubmissionSchema.safeParse(spamPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Spam detected");
      }
    });

    it("cross-checks sub-services against category on full submission", () => {
      const mismatchedPayload = {
        ...validFullPayload,
        serviceCategory: "ai-automation",
        subServices: ["cloud-infrastructure"], // belongs to cloud-devops
      };
      const result = inquirySubmissionSchema.safeParse(mismatchedPayload);
      expect(result.success).toBe(false);
    });
  });
});
