import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  _resetSupabaseAdminClientForTesting,
  getSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

describe("Server-Side Supabase Client Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset cached instance and environment before each test
    _resetSupabaseAdminClientForTesting();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    _resetSupabaseAdminClientForTesting();
    process.env = originalEnv;
  });

  it("reports isSupabaseConfigured() as false when variables are absent", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(isSupabaseConfigured()).toBe(false);
  });

  it("reports isSupabaseConfigured() as true when variables are set", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

    expect(isSupabaseConfigured()).toBe(true);
  });

  it("throws a descriptive error when SUPABASE_URL is missing", () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

    expect(() => getSupabaseAdminClient()).toThrowError(/SUPABASE_URL/);
  });

  it("throws a descriptive error when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseAdminClient()).toThrowError(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("throws a critical security error if invoked when window is defined (browser environment)", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

    // Simulate browser window global
    // @ts-expect-error Mocking browser window for security testing
    globalThis.window = {} as Window & typeof globalThis;

    expect(() => getSupabaseAdminClient()).toThrowError(
      /CRITICAL SECURITY VIOLATION: getSupabaseAdminClient\(\) was called in a browser environment/
    );

    // Cleanup mock window
    // @ts-expect-error Cleaning up mock
    delete globalThis.window;
  });

  it("successfully creates and returns a singleton SupabaseClient when configured", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

    const client1 = getSupabaseAdminClient();
    expect(client1).toBeDefined();
    expect(client1.from).toBeInstanceOf(Function);

    // Verify singleton caching
    const client2 = getSupabaseAdminClient();
    expect(client1).toBe(client2);
  });
});
