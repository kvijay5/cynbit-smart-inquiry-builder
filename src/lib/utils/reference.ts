import crypto from "crypto";

/**
 * Unambiguous alphanumeric character set for human-friendly reference codes.
 * Excludes characters easily confused when read or handwritten (0, O, I, 1).
 */
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically secure, human-readable reference number.
 * Format: CYN-YYYYMMDD-XXXX
 *
 * Example: "CYN-20261101-7M9K"
 *
 * @param date Optional date for testing (defaults to current UTC date)
 */
export function generateInquiryReference(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const dateSegment = `${year}${month}${day}`;

  // Generate 4 cryptographically secure random characters
  const randomBytes = crypto.randomBytes(4);
  let randomSegment = "";

  for (let i = 0; i < 4; i++) {
    const randomIndex = randomBytes[i] % REFERENCE_ALPHABET.length;
    randomSegment += REFERENCE_ALPHABET[randomIndex];
  }

  return `CYN-${dateSegment}-${randomSegment}`;
}

/**
 * Validates whether a given string matches the CYN-YYYYMMDD-XXXX format.
 */
export function isValidInquiryReference(reference: string): boolean {
  if (!reference || typeof reference !== "string") return false;
  const referencePattern = /^CYN-\d{8}-[A-Z0-9]{4}$/;
  return referencePattern.test(reference);
}
