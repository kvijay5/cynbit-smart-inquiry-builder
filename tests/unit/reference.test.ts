import { describe, expect, it } from "vitest";
import { generateInquiryReference, isValidInquiryReference } from "@/lib/utils/reference";

describe("Reference Generator Utility", () => {
  it("generates a reference matching the CYN-YYYYMMDD-XXXX format", () => {
    const reference = generateInquiryReference();
    expect(isValidInquiryReference(reference)).toBe(true);
    expect(reference).toMatch(/^CYN-\d{8}-[A-Z0-9]{4}$/);
  });

  it("embeds the provided UTC date correctly", () => {
    // 2026-11-01T12:00:00Z
    const testDate = new Date(Date.UTC(2026, 10, 1, 12, 0, 0));
    const reference = generateInquiryReference(testDate);

    expect(reference.startsWith("CYN-20261101-")).toBe(true);
    expect(reference.length).toBe(17); // "CYN-" (4) + "20261101" (8) + "-" (1) + "XXXX" (4) = 17
  });

  it("generates unique values with high cryptographic entropy", () => {
    const generated = new Set<string>();
    const count = 100;

    for (let i = 0; i < count; i++) {
      generated.add(generateInquiryReference());
    }

    // High diversity check: across 100 samples from ~1M space, collisions are extremely rare
    expect(generated.size).toBeGreaterThanOrEqual(98);
  });

  it("accurately validates valid and invalid references", () => {
    expect(isValidInquiryReference("CYN-20261101-A9BC")).toBe(true);
    expect(isValidInquiryReference("CYN-20261101-9999")).toBe(true);

    // Invalid examples
    expect(isValidInquiryReference("")).toBe(false);
    expect(isValidInquiryReference("CYN-2026110-A9BC")).toBe(false); // Only 7 date digits
    expect(isValidInquiryReference("CYN-20261101-A9B")).toBe(false); // Only 3 suffix chars
    expect(isValidInquiryReference("CYN-20261101-a9bc")).toBe(false); // Lowercase
    expect(isValidInquiryReference("INVALID-REFERENCE")).toBe(false);
  });
});
