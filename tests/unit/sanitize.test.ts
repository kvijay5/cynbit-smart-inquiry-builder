import { describe, expect, it } from "vitest";
import { normalizeEmail, sanitizePhone, sanitizeText } from "@/lib/utils/sanitize";

describe("Sanitization Utilities", () => {
  describe("normalizeEmail", () => {
    it("converts uppercase characters to lowercase", () => {
      expect(normalizeEmail("JOHN.DOE@EXAMPLE.COM")).toBe("john.doe@example.com");
    });

    it("trims surrounding whitespace", () => {
      expect(normalizeEmail("   user@cynbit.in   ")).toBe("user@cynbit.in");
    });

    it("handles empty or invalid inputs gracefully", () => {
      expect(normalizeEmail("")).toBe("");
      // @ts-expect-error Testing non-string defensive handling
      expect(normalizeEmail(null)).toBe("");
    });
  });

  describe("sanitizeText", () => {
    it("trims leading and trailing spaces", () => {
      expect(sanitizeText("   Hello Cynbit!   ")).toBe("Hello Cynbit!");
    });

    it("removes unprintable control characters", () => {
      const malicious = "Project\u0000Description\u0007With\u001FHiddenChars";
      expect(sanitizeText(malicious)).toBe("ProjectDescriptionWithHiddenChars");
    });

    it("preserves legitimate newlines and spaces", () => {
      const multiline = "Line 1\nLine 2\nLine 3";
      expect(sanitizeText(multiline)).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("sanitizePhone", () => {
    it("preserves standard phone characters", () => {
      expect(sanitizePhone("+1 (555) 123-4567")).toBe("+1 (555) 123-4567");
    });

    it("strips malicious script or letters from phone fields", () => {
      expect(sanitizePhone("+91 9876543210 <script>")).toBe("+91 9876543210");
    });

    it("returns null for empty phone numbers", () => {
      expect(sanitizePhone("")).toBeNull();
      expect(sanitizePhone(null)).toBeNull();
    });
  });
});
