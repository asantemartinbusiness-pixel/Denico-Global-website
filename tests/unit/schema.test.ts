import { describe, expect, it } from "vitest";
import { enquirySchema, envelopeSchema, fieldErrors } from "@/lib/enquiry/schema";

const valid = {
  name: "  Ada   Lovelace ",
  email: "  Ada@Example.COM ",
  enquiryType: "general",
  message: "Hello,\r\n\r\n\r\n\r\nI would like to discuss a matter.\u0007",
};

describe("enquirySchema", () => {
  it("normalises whitespace, email case and control characters", () => {
    const result = enquirySchema.parse(valid);
    expect(result.name).toBe("Ada Lovelace");
    expect(result.email).toBe("ada@example.com");
    expect(result.message).toBe("Hello,\n\nI would like to discuss a matter.");
  });

  it("reports one clear message per invalid field", () => {
    const result = enquirySchema.safeParse({ name: "", email: "not-an-email", enquiryType: "other", message: "short" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrors(result.error);
    expect(errors.name).toBe("Enter your name.");
    expect(errors.email).toMatch(/format name@example.com/);
    expect(errors.enquiryType).toBe("Choose the type of enquiry.");
    expect(errors.message).toMatch(/at least 10 characters/);
  });

  it("treats whitespace-only values as missing", () => {
    const result = enquirySchema.safeParse({ ...valid, name: "   ", message: "   \n  " });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(fieldErrors(result.error)).toMatchObject({ name: "Enter your name.", message: "Enter your message." });
  });

  it("rejects over-long fields", () => {
    const result = enquirySchema.safeParse({ ...valid, message: "x".repeat(4001) });
    expect(result.success).toBe(false);
  });

  it("rejects header-injection attempts in single-line fields by flattening newlines", () => {
    const result = enquirySchema.parse({ ...valid, name: "Ada\r\nBcc: victim@example.com" });
    expect(result.name).not.toMatch(/[\r\n]/);
  });

  it("strips bidi overrides and zero-width spaces but keeps emoji joiners and RTL marks", () => {
    const result = enquirySchema.parse({
      ...valid,
      name: "Ada\u202Eecilam\u200B",
      message: "Family 👨\u200D👩\u200D👧 and \u200Fשלום, regards.",
    });
    expect(result.name).toBe("Adaecilam");
    expect(result.message).toContain("👨\u200D👩\u200D👧");
    expect(result.message).toContain("\u200F");
  });
});

describe("envelopeSchema", () => {
  it("requires an empty honeypot", () => {
    expect(
      envelopeSchema.safeParse({ website: "spam", startedAt: 1, idempotencyKey: "abcdefabcdefabcdef" }).success,
    ).toBe(false);
  });

  it("requires a well-formed idempotency key", () => {
    expect(envelopeSchema.safeParse({ startedAt: 1, idempotencyKey: "short" }).success).toBe(false);
    expect(envelopeSchema.safeParse({ startedAt: 1, idempotencyKey: "<script>alert(1)</script>" }).success).toBe(false);
  });
});
