import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-Side Supabase Admin Client
 *
 * CRITICAL SECURITY ARCHITECTURE:
 * 1. This module is strictly designed for server-side environments (Next.js Route Handlers).
 * 2. It utilizes the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS and possesses full admin rights.
 * 3. It MUST NEVER be imported, called, or bundled into client-side React components.
 * 4. It includes an explicit runtime assertion verifying that `window` is undefined.
 */

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Checks whether the required Supabase environment variables are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && serviceKey);
}

/**
 * Returns a singleton instance of the Supabase Admin Client.
 *
 * @throws {Error} If called in a browser runtime or if required environment variables are missing.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  // Runtime environment assertion: never allow execution in the browser
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: getSupabaseAdminClient() was called in a browser environment. " +
        "The Supabase service-role key must remain strictly confidential on the server."
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Supabase configuration error: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) environment variable is not defined."
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
