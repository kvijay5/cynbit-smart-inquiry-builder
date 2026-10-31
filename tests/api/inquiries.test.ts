import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inquiries/route";

// Mock the server-side Supabase client module for unit/integration testing
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

  it("returns 413 when payload exceeds 100 KB limit", async () => {
    // Generate an oversized string (> 100 KB)
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

  it("successfully creates a new inquiry and returns 201 Created (Mocked Database)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            reference: "CYN-20261101-ABCD",
            created_at: "2026-11-01T00:00:00.000Z",
            status: "new",
          },
          error: null,
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

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.reference).toBe("CYN-20261101-ABCD");
    expect(body.data.status).toBe("new");
    expect(body.data.message).toContain("submitted successfully");
  });

  it("handles duplicate key conflict (23505) and returns existing inquiry with 200 OK (Idempotent Replay)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    // Mock insert failure due to PostgreSQL unique constraint violation (code 23505)
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "23505", message: "duplicate key value violates unique constraint" },
        }),
      }),
    });

    // Mock subsequent lookup for the existing record
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

  it("handles unexpected database error gracefully without leaking secrets (500 Internal Error)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST500", message: "Database connection failed unexpectedly" },
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
    // Ensure raw database error messages or internal connection details are NOT leaked to the client
    expect(body.error.message).not.toContain("PGRST500");
    expect(body.error.message).not.toContain("Database connection failed");
  });
});
