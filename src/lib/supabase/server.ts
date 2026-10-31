import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-Side Supabase Admin Client
 *
 * CRITICAL SECURITY ARCHITECTURE:
 * 1. The `server-only` import triggers a compile-time build failure if this file is ever
 *    imported into a client-side ("use client") React component.
 * 2. It utilizes the SUPABASE_SERVICE_ROLE_KEY, which possesses full admin access on the server.
 * 3. As an additional runtime safeguard, an explicit check ensures `window` is undefined.
 * 4. Only the server-side SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are used.
 */

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Checks whether the required server-side Supabase environment variables are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && serviceKey);
}

/**
 * Returns a singleton instance of the Supabase Admin Client.
 *
 * @throws {Error} If called in a browser runtime or if required environment variables are missing.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  // Runtime environment assertion: defense-in-depth safeguard
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: getSupabaseAdminClient() was called in a browser environment. " +
        "The Supabase service-role key must remain strictly confidential on the server."
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Supabase configuration error: SUPABASE_URL environment variable is not defined. " +
        "Please configure this in your server environment."
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      "Supabase configuration error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined. " +
        "Please configure this in your .env.local file on the server."
    );
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedAdminClient;
}

/**
 * Utility for automated unit tests to reset the cached singleton client.
 * @internal
 */
export function _resetSupabaseAdminClientForTesting(): void {
  cachedAdminClient = null;
}
