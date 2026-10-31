import { NextRequest, NextResponse } from "next/server";
import { FORM_LIMITS } from "@/lib/constants/services";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { generateInquiryReference } from "@/lib/utils/reference";
import { inquirySubmissionSchema } from "@/lib/validations/inquiry";
import { ApiResponse, InquirySubmissionResult } from "@/types/inquiry";

/**
 * POST /api/inquiries
 *
 * Handles submission of multi-step project inquiries.
 *
 * Security & Reliability Pipeline:
 * 1. Enforces Content-Type: application/json (415 Unsupported Media Type)
 * 2. Enforces 100 KB payload size limit (413 Payload Too Large)
 * 3. Bot trap: Checks honeypot field (400 Bad Request with neutral message)
 * 4. Server-side validation: Re-validates all fields via Zod (400 Bad Request)
 * 5. Input normalization: Trims and lowercases emails, sanitizes text inputs
 * 6. Idempotent insertion: Uses PostgreSQL UNIQUE(idempotency_key) to handle
 *    concurrent duplicate submissions gracefully (200 OK for replays, 201 Created for new)
 * 7. Secure error handling: Never leaks raw database errors or stack traces to clients
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<InquirySubmissionResult>>> {
  try {
    // 1. Enforce Content-Type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Request Content-Type must be application/json.",
          },
        },
        { status: 415 }
      );
    }

    // 2. Enforce request size limit (Header check)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > FORM_LIMITS.MAX_REQUEST_BODY_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `Request payload exceeds maximum allowed limit of ${FORM_LIMITS.MAX_REQUEST_BODY_BYTES / 1024} KB.`,
          },
        },
        { status: 413 }
      );
    }

    // Read raw body to protect against streaming payload overflow
    const rawBody = await request.text();
    const bodyBytes = new TextEncoder().encode(rawBody).length;

    if (bodyBytes > FORM_LIMITS.MAX_REQUEST_BODY_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `Request payload exceeds maximum allowed limit of ${FORM_LIMITS.MAX_REQUEST_BODY_BYTES / 1024} KB.`,
          },
        },
        { status: 413 }
      );
    }

    // Parse JSON
    let parsedBody: Record<string, unknown>;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MALFORMED_JSON",
            message: "Request body contains invalid JSON.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Honeypot Bot Detection
    // Real users will never see or populate this field.
    if (
      parsedBody.honeypot &&
      typeof parsedBody.honeypot === "string" &&
      parsedBody.honeypot.trim().length > 0
    ) {
      // Return a neutral, non-descriptive error to avoid giving feedback to automated spambots
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Unable to process inquiry. Please check your submission details.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Server-Side Zod Validation
    const validationResult = inquirySubmissionSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const fieldKey = issue.path.join(".") || "submission";
        if (!fieldErrors[fieldKey]) {
          fieldErrors[fieldKey] = [];
        }
        fieldErrors[fieldKey].push(issue.message);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed. Please correct the highlighted errors.",
            details: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // 5. Database Connection Verification
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_UNAVAILABLE",
            message: "The inquiry service is temporarily unavailable. Please try again shortly.",
          },
        },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // 6. Generate Reference & Prepare Record
    const reference = generateInquiryReference();
    const consentTimestamp = new Date().toISOString();

    const recordToInsert = {
      reference,
      idempotency_key: validData.idempotencyKey,
      service_category: validData.serviceCategory,
      sub_services: validData.subServices,
      project_description: validData.projectDescription,
      budget_range: validData.budgetRange,
      timeline: validData.timeline,
      name: validData.name,
      email: validData.email,
      phone: validData.phone || null,
      company: validData.company || null,
      consent_at: consentTimestamp,
      status: "new",
    };

    // 7. Insert with Concurrent Idempotency Conflict Handling
    const { data: insertedRecord, error: insertError } = await supabase
      .from("inquiries")
      .insert(recordToInsert)
      .select("reference, created_at, status")
      .single();

    if (insertError) {
      // PostgreSQL Unique Violation error code: 23505
      if (insertError.code === "23505") {
        // Query the existing inquiry associated with this idempotency key
        const { data: existingRecord, error: lookupError } = await supabase
          .from("inquiries")
          .select("reference, created_at, status")
          .eq("idempotency_key", validData.idempotencyKey)
          .single();

        if (existingRecord && !lookupError) {
          // Idempotent success: return existing submission data with 200 OK
          return NextResponse.json(
            {
              success: true,
              data: {
                reference: existingRecord.reference,
                createdAt: existingRecord.created_at,
                status: existingRecord.status,
                message: "Inquiry was already received (idempotent submission).",
              },
            },
            { status: 200 }
          );
        }
      }

      // Log error code server-side for diagnostics, but never expose raw DB details to client
      console.error("[Inquiry API] Database insertion error code:", insertError.code);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "An unexpected error occurred while saving your inquiry. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    // 8. Successful Creation (201 Created)
    return NextResponse.json(
      {
        success: true,
        data: {
          reference: insertedRecord.reference,
          createdAt: insertedRecord.created_at,
          status: insertedRecord.status,
          message: "Project inquiry submitted successfully.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Catch unhandled exceptions safely
    console.error("[Inquiry API] Unexpected internal error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An internal server error occurred. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
