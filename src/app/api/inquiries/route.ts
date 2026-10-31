import { NextRequest, NextResponse } from "next/server";
import { FORM_LIMITS } from "@/lib/constants/services";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { generateInquiryReference } from "@/lib/utils/reference";
import { inquirySubmissionSchema } from "@/lib/validations/inquiry";
import { ApiResponse, InquirySubmissionResult } from "@/types/inquiry";

const MAX_REFERENCE_RETRIES = 3;

/**
 * Safely reads the incoming request body stream up to the byte limit.
 * Cancels stream reading early if payload exceeds maximum limit to protect
 * against denial-of-service memory exhaustion.
 */
async function readBoundedRequestBody(
  request: NextRequest,
  maxBytes: number
): Promise<{ text: string } | { error: "TOO_LARGE" | "READ_ERROR" }> {
  // If Content-Length header is present and already too large, fail immediately
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return { error: "TOO_LARGE" };
  }

  if (!request.body) {
    return { text: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > maxBytes) {
          // Abort reading remaining stream immediately
          await reader.cancel();
          return { error: "TOO_LARGE" };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { error: "READ_ERROR" };
  }

  const combined = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return { text: new TextDecoder().decode(combined) };
}

/**
 * POST /api/inquiries
 *
 * Handles submission of multi-step project inquiries.
 *
 * Security & Reliability Pipeline:
 * 1. Enforces Content-Type: application/json (415)
 * 2. Enforces 100 KB payload limit on actual incoming stream (413)
 * 3. Honeypot check: Neutral 400 rejection on bot traps
 * 4. Server-side Zod validation & normalization (400)
 * 5. Server generates consent_at timestamp (never trusts client timestamps)
 * 6. Handles PostgreSQL 23505 unique conflicts:
 *    - If idempotency_key conflicts -> returns existing inquiry (200 OK idempotent replay)
 *    - If reference conflicts -> regenerates reference and retries safely (up to 3 times)
 *    - Never confuses a reference collision with an idempotency replay
 * 7. Secure logs & responses: No customer PII or raw database internals exposed
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

    // 2. Enforce 100 KB limit against actual incoming request stream
    const readResult = await readBoundedRequestBody(request, FORM_LIMITS.MAX_REQUEST_BODY_BYTES);
    if ("error" in readResult) {
      if (readResult.error === "TOO_LARGE") {
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STREAM_READ_ERROR",
            message: "Failed to read request payload stream.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Parse JSON safely
    let parsedBody: Record<string, unknown>;
    try {
      parsedBody = JSON.parse(readResult.text);
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

    // 4. Honeypot Bot Detection
    // Checks both field aliases ('honeypot' and 'inquiry_bot_trap').
    const honeypotContent =
      (typeof parsedBody.honeypot === "string" ? parsedBody.honeypot : "") ||
      (typeof parsedBody.inquiry_bot_trap === "string" ? parsedBody.inquiry_bot_trap : "");

    if (honeypotContent.trim().length > 0) {
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

    // 5. Server-Side Zod Validation
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

    // 6. Database Configuration Verification
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

    // 7. Server Generates Consent Timestamp (Client timestamp is never trusted)
    const serverConsentTimestamp = new Date().toISOString();

    // 8. Insert with Reference Collision Retry & Idempotency Resolution
    let insertedRecord = null;
    let finalError = null;

    for (let attempt = 0; attempt < MAX_REFERENCE_RETRIES; attempt++) {
      const reference = generateInquiryReference();

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
        consent_at: serverConsentTimestamp,
        status: "new",
      };

      const { data, error } = await supabase
        .from("inquiries")
        .insert(recordToInsert)
        .select("reference, created_at, status")
        .single();

      if (!error && data) {
        insertedRecord = data;
        finalError = null;
        break;
      }

      finalError = error;

      // Handle PostgreSQL Unique Violation (code 23505)
      if (error && error.code === "23505") {
        const errorText = `${error.message || ""} ${error.details || ""}`.toLowerCase();

        const isReferenceConflict =
          errorText.includes("uq_inquiries_reference") ||
          (errorText.includes("reference") && !errorText.includes("idempotency_key"));

        // Case A: Reference collision (very rare) -> Retry with a newly generated reference
        if (isReferenceConflict) {
          continue; // Loop to generate a new reference and retry insert
        }

        // Case B: Idempotency Key collision -> Lookup existing inquiry and return 200 OK
        const { data: existingRecord, error: lookupError } = await supabase
          .from("inquiries")
          .select("reference, created_at, status")
          .eq("idempotency_key", validData.idempotencyKey)
          .single();

        if (existingRecord && !lookupError) {
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

        // If lookup by idempotency key found nothing, it could be a reference conflict with unspecified details
        // Retry reference generation if attempts remain
        continue;
      }

      // Non-23505 error: break out without retrying
      break;
    }

    if (finalError || !insertedRecord) {
      // Diagnostic log only: error code only, never customer PII or raw secrets
      console.error("[Inquiry API] Database insertion error code:", finalError?.code || "UNKNOWN");

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

    // 9. Return 201 Created
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
    // Catch-all: log error name only, never expose stack traces or customer data
    console.error("[Inquiry API] Unexpected internal error:", error instanceof Error ? error.name : "Unknown");
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
