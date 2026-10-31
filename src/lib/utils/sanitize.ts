/**
 * String and Email Sanitization Utilities
 *
 * Keeps user data clean, prevents database storage anomalies,
 * and ensures emails are uniformly searchable and lowercased.
 */

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * Example: "  John.Doe@EXAMPLE.COM  " -> "john.doe@example.com"
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Sanitizes generic user text by trimming leading/trailing whitespace
 * and removing null bytes or invisible control characters.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  // Strip control characters (except common newlines/tabs) and trim
  return text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "").trim();
}

/**
 * Strips disallowed characters from phone strings, preserving standard formatting characters (+, -, (), spaces, digits).
 */
export function sanitizePhone(phone?: string | null): string | null {
  if (!phone || typeof phone !== "string") return null;
  const cleaned = phone.replace(/[^\d+\-() ]/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}
