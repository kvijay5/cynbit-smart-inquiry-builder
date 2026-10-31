import {
  BUDGET_RANGE_IDS,
  SERVICE_CATEGORY_IDS,
  TIMELINE_IDS,
} from "@/lib/constants/services";

export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];
export type BudgetRangeId = (typeof BUDGET_RANGE_IDS)[number];
export type TimelineId = (typeof TIMELINE_IDS)[number];

export type InquiryStatus = "new" | "reviewed" | "contacted" | "archived";

// Step 1: Services Selection
export interface Step1Data {
  serviceCategory: ServiceCategoryId;
  subServices: string[];
}

// Step 2: Project Scope & Description
export interface Step2Data {
  projectDescription: string;
}

// Step 3: Budget & Timeline
export interface Step3Data {
  budgetRange: BudgetRangeId;
  timeline: TimelineId;
}

// Step 4: Contact & Consent
export interface Step4Data {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  consent: boolean;
  honeypot?: string; // Hidden anti-spam trap
}

// Full Client-side Wizard State
export interface InquiryFormData extends Step1Data, Step2Data, Step3Data, Step4Data {
  idempotencyKey: string;
}

// API Request Payload (POST /api/inquiries)
export interface InquirySubmissionPayload {
  serviceCategory: string;
  subServices: string[];
  projectDescription: string;
  budgetRange: string;
  timeline: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  consent: boolean;
  honeypot?: string;
  idempotencyKey: string;
}

// Database Record in Supabase PostgreSQL (`inquiries` table)
export interface InquiryDatabaseRecord {
  id: string;
  reference: string;
  idempotency_key: string;
  service_category: string;
  sub_services: string[];
  project_description: string;
  budget_range: string;
  timeline: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  consent_at: string; // ISO 8601 timestamp
  status: InquiryStatus;
  created_at: string; // ISO 8601 timestamp
}

// Standard API Response Structure
export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
      };
    };

// Successful Inquiry Submission Result
export interface InquirySubmissionResult {
  reference: string;
  createdAt: string;
  status: InquiryStatus;
  message: string;
}
