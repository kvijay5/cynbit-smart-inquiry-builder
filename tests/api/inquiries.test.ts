import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inquiries/route";

// Mock the server-side Supabase client module for testing
// (Clearly marked as MOCKED: No live database connection is made in these tests)
vi.mock("@/lib/supabase/server", () => {
  return {
    isSupabaseConfigured: vi.fn(),
    getSupabaseAdminClient: vi.fn(),
  };
});

import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

describe("POST /api/inquiries (Mocked Route Handler Tests)", () => {
  const validPayload = {
    idempotencyKey: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    serviceCategory: "ai-automation",
    subServices: ["custom-llm", "autonomous-agents"],
    projectDescription: "We need an intelligent autonomous agent workflow for our customer CRM platform.",
    budgetRange: "15k-30k",
    timeline: "1-3-months",
    name: "Kruti Vijay",
    email: "Kruti.Vijay@example.com",
    phone: "+91 9876543210",
    company: "AI Labs",
    consent: true,
    honeypot: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns 415 when Content-Type is not application/json", async () => {
    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "plain text payload",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(415);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 413 when payload exceeds 100 KB limit via Content-Length", async () => {
    const largeDescription = "X".repeat(105 * 1024);
    const oversizedPayload = JSON.stringify({ ...validPayload, projectDescription: largeDescription });

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(oversizedPayload.length),
      },
      body: oversizedPayload,
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 413 when actual stream payload exceeds 100 KB even without Content-Length", async () => {
    const largeDescription = "Y".repeat(105 * 1024);
    const oversizedPayload = JSON.stringify({ ...validPayload, projectDescription: largeDescription });

    // Header omitted deliberately to test streaming byte counter enforcement
    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: oversizedPayload,
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 400 when body contains malformed JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ malformed json string ...",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("MALFORMED_JSON");
  });

  it("quietly rejects requests when honeypot field is filled by spambots", async () => {
    const spamPayload = {
      ...validPayload,
      honeypot: "https://spam-link.xyz",
    };

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(spamPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("quietly rejects requests when inquiry_bot_trap alias is filled by HTML-scraping bots", async () => {
    const spamPayload = {
      ...validPayload,
      inquiry_bot_trap: "automated-form-filler-value",
    };

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(spamPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("returns 400 with validation details when required fields fail Zod validation", async () => {
    const invalidPayload = {
      ...validPayload,
      email: "invalid-email-address",
      projectDescription: "Too short", // Min is 20 chars
    };

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.email).toBeDefined();
    expect(body.error.details.projectDescription).toBeDefined();
  });

  it("returns 503 when Supabase database is not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("DATABASE_UNAVAILABLE");
  });

  it("successfully creates a new inquiry and server generates consent_at timestamp", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    let capturedInsertRecord: Record<string, unknown> | null = null;

    const mockInsert = vi.fn().mockImplementation((record) => {
      capturedInsertRecord = record;
      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              reference: record.reference,
              created_at: "2026-11-01T00:00:00.000Z",
              status: "new",
            },
            error: null,
          }),
        }),
      };
    });

    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("new");
    expect(body.data.message).toContain("submitted successfully");

    // Verify server generated a valid ISO consent timestamp
    expect(capturedInsertRecord).not.toBeNull();
    expect(capturedInsertRecord!["consent_at"]).toBeDefined();
    expect(typeof capturedInsertRecord!["consent_at"]).toBe("string");
    // Verify consent_at matches ISO format
    expect(new Date(capturedInsertRecord!["consent_at"] as string).toISOString()).toBe(
      capturedInsertRecord!["consent_at"]
    );
  });

  it("handles idempotency key conflict (23505) and returns existing inquiry with 200 OK", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    // Mock insert failure due to PostgreSQL unique constraint on idempotency_key
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: "23505",
            message: 'duplicate key value violates unique constraint "uq_inquiries_idempotency_key"',
            details: "Key (idempotency_key)=(...) already exists.",
          },
        }),
      }),
    });

    const mockLookup = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              reference: "CYN-20261101-EXIST",
              created_at: "2026-11-01T00:00:00.000Z",
              status: "new",
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "inquiries") {
          return {
            insert: mockInsert,
            select: mockLookup().select,
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.reference).toBe("CYN-20261101-EXIST");
    expect(body.data.message).toContain("already received");
  });

  it("handles reference collision by regenerating reference and retrying insert (does NOT replay idempotency)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    let insertCallCount = 0;
    const generatedReferences: string[] = [];

    const mockInsert = vi.fn().mockImplementation((record) => {
      insertCallCount++;
      generatedReferences.push(record.reference);

      if (insertCallCount === 1) {
        // Attempt 1: Simulate rare reference collision (uq_inquiries_reference violated)
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "uq_inquiries_reference"',
                details: `Key (reference)=(${record.reference}) already exists.`,
              },
            }),
          }),
        };
      }

      // Attempt 2: Insertion succeeds with new reference
      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              reference: record.reference,
              created_at: "2026-11-01T00:00:01.000Z",
              status: "new",
            },
            error: null,
          }),
        }),
      };
    });

    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201); // Successfully created on retry!
    expect(body.success).toBe(true);
    expect(insertCallCount).toBe(2);
    // Verified two different references were generated
    expect(generatedReferences[0]).not.toBe(generatedReferences[1]);
    expect(body.data.reference).toBe(generatedReferences[1]);
  });

  it("handles unexpected database error without leaking PII or database secrets (500)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST500", message: "Internal Postgres connection error at postgres://user:secret@db.host" },
        }),
      }),
    });

    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const request = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("DATABASE_ERROR");

    // Ensure database internals and customer PII are NOT leaked
    const responseString = JSON.stringify(body);
    expect(responseString).not.toContain("PGRST500");
    expect(responseString).not.toContain("postgres://");
    expect(responseString).not.toContain("Kruti");
    expect(responseString).not.toContain("kruti.vijay@example.com");
  });
});
