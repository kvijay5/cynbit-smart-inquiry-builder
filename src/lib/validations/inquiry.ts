import { z } from "zod";
import {
  BUDGET_RANGE_IDS,
  FORM_LIMITS,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_IDS,
  TIMELINE_IDS,
} from "../constants/services";
import { normalizeEmail, sanitizeText } from "../utils/sanitize";

/**
 * Step 1: Service Category & Sub-services Validation
 */
export const step1Schema = z
  .object({
    serviceCategory: z.enum(SERVICE_CATEGORY_IDS, {
      errorMap: () => ({ message: "Please select a valid service category." }),
    }),
    subServices: z
      .array(z.string().min(1, "Sub-service ID cannot be empty."))
      .min(1, "Please select at least one relevant sub-service."),
  })
  .superRefine((data, ctx) => {
    // Find the category definition to cross-check valid sub-services
    const category = SERVICE_CATEGORIES.find((c) => c.id === data.serviceCategory);
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceCategory"],
        message: "Unknown service category selected.",
      });
      return;
    }

    const validSubServiceIds = new Set(category.subServices.map((s) => s.id));
    const invalidSelections = data.subServices.filter((sub) => !validSubServiceIds.has(sub));

    if (invalidSelections.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subServices"],
        message: `Selected sub-services do not belong to ${category.name}: ${invalidSelections.join(", ")}`,
      });
    }
  });

/**
 * Step 2: Project Scope & Description Validation
 */
export const step2Schema = z.object({
  projectDescription: z
    .string({ required_error: "Project description is required." })
    .transform((val) => sanitizeText(val))
    .pipe(
      z
        .string()
        .min(
          FORM_LIMITS.MIN_DESCRIPTION_LENGTH,
          `Please provide at least ${FORM_LIMITS.MIN_DESCRIPTION_LENGTH} characters so we can understand your project requirements.`
        )
        .max(
          FORM_LIMITS.MAX_DESCRIPTION_LENGTH,
          `Project description cannot exceed ${FORM_LIMITS.MAX_DESCRIPTION_LENGTH} characters.`
        )
    ),
});

/**
 * Step 3: Budget Range & Timeline Validation
 */
export const step3Schema = z.object({
  budgetRange: z.enum(BUDGET_RANGE_IDS, {
    errorMap: () => ({ message: "Please choose a project budget range." }),
  }),
  timeline: z.enum(TIMELINE_IDS, {
    errorMap: () => ({ message: "Please select your expected project timeline." }),
  }),
});

/**
 * Phone number validation allowing standard international formats
 * Examples: "+1 (555) 019-2834", "+91 9876543210", "555-0199"
 */
const phoneRegex = /^[+()0-9\s.-]{7,25}$/;

function isValidPhone(val?: string): boolean {
  if (!val || val.trim() === "") return true;
  const trimmed = val.trim();
  if (!phoneRegex.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 7 && digitCount <= 15;
}

/**
 * Step 4: Contact Information, Privacy Consent & Honeypot
 */
export const step4Schema = z.object({
  name: z
    .string({ required_error: "Your name is required." })
    .transform((val) => sanitizeText(val))
    .pipe(
      z
        .string()
        .min(FORM_LIMITS.MIN_NAME_LENGTH, "Name must be at least 2 characters.")
        .max(FORM_LIMITS.MAX_NAME_LENGTH, "Name cannot exceed 100 characters.")
    ),
  email: z
    .string({ required_error: "Email address is required." })
    .transform((val) => normalizeEmail(val))
    .pipe(z.string().email("Please enter a valid email address (e.g., name@example.com).")),
  phone: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val) : ""))
    .pipe(
      z
        .string()
        .refine(
          isValidPhone,
          "Please enter a valid phone number or leave it blank."
        )
        .optional()
    ),
  company: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val) : ""))
    .pipe(
      z.string().max(FORM_LIMITS.MAX_COMPANY_LENGTH, "Company name cannot exceed 100 characters.").optional()
    ),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to being contacted regarding this project inquiry.",
    }),
  }),
  // Honeypot field: invisible to real users in the UI, used to catch automated bots
  honeypot: z.string().optional(),
});

/**
 * Full API Submission Schema (POST /api/inquiries)
 * Validates the complete multi-step payload plus the Idempotency Key and strict Honeypot check.
 */
export const inquirySubmissionSchema = z
  .object({
    idempotencyKey: z
      .string({ required_error: "Idempotency key is required." })
      .uuid("Invalid idempotency key format. Must be a valid UUIDv4."),
    serviceCategory: z.enum(SERVICE_CATEGORY_IDS, {
      errorMap: () => ({ message: "Please select a valid service category." }),
    }),
    subServices: z
      .array(z.string().min(1, "Sub-service ID cannot be empty."))
      .min(1, "Please select at least one relevant sub-service."),
    projectDescription: z
      .string({ required_error: "Project description is required." })
      .transform((val) => sanitizeText(val))
      .pipe(
        z
          .string()
          .min(
            FORM_LIMITS.MIN_DESCRIPTION_LENGTH,
            `Please provide at least ${FORM_LIMITS.MIN_DESCRIPTION_LENGTH} characters describing your project.`
          )
          .max(
            FORM_LIMITS.MAX_DESCRIPTION_LENGTH,
            `Project description cannot exceed ${FORM_LIMITS.MAX_DESCRIPTION_LENGTH} characters.`
          )
      ),
    budgetRange: z.enum(BUDGET_RANGE_IDS, {
      errorMap: () => ({ message: "Please select an estimated budget range." }),
    }),
    timeline: z.enum(TIMELINE_IDS, {
      errorMap: () => ({ message: "Please select an expected timeline." }),
    }),
    name: z
      .string({ required_error: "Your name is required." })
      .transform((val) => sanitizeText(val))
      .pipe(
        z
          .string()
          .min(FORM_LIMITS.MIN_NAME_LENGTH, "Name must be at least 2 characters.")
          .max(FORM_LIMITS.MAX_NAME_LENGTH, "Name cannot exceed 100 characters.")
      ),
    email: z
      .string({ required_error: "Email address is required." })
      .transform((val) => normalizeEmail(val))
      .pipe(z.string().email("Please enter a valid email address.")),
    phone: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val) : ""))
      .pipe(
        z
          .string()
          .refine(
            isValidPhone,
            "Please enter a valid phone number or leave it blank."
          )
          .optional()
      ),
    company: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val) : ""))
      .pipe(
        z.string().max(FORM_LIMITS.MAX_COMPANY_LENGTH, "Company name cannot exceed 100 characters.").optional()
      ),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "You must consent to being contacted regarding this inquiry.",
      }),
    }),
    // Honeypot field: MUST be empty or undefined. If filled, request is rejected!
    honeypot: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.trim().length === 0,
        "Spam detected: Honeypot field must remain empty."
      ),
  })
  .superRefine((data, ctx) => {
    // Cross-validate that selected sub-services match the selected service category
    const category = SERVICE_CATEGORIES.find((c) => c.id === data.serviceCategory);
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceCategory"],
        message: "Invalid service category selected.",
      });
      return;
    }

    const validSubServiceIds = new Set(category.subServices.map((s) => s.id));
    const invalidSelections = data.subServices.filter((sub) => !validSubServiceIds.has(sub));

    if (invalidSelections.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subServices"],
        message: `Selected sub-services do not belong to ${category.name}: ${invalidSelections.join(", ")}`,
      });
    }
  });

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;
