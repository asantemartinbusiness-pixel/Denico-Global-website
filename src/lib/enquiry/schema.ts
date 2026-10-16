import { z } from "zod";

// No runtime code generation: keeps the CSP free of 'unsafe-eval' and avoids eval probes.
z.config({ jitless: true });

export const ENQUIRY_TYPES = ["general", "press", "studios"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  general: "Group and business enquiry",
  press: "Press and media",
  studios: "Denico Studios",
};

export const LIMITS = {
  name: 120,
  email: 254,
  message: 4000,
  messageMin: 10,
} as const;

/** Minimum time between form render and submission, a light bot check. */
export const MIN_FILL_TIME_MS = 2500;
/** Submissions older than this are stale. Over 20 hours, per the WCAG 2.2.1 exception. */
export const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

/**
 * Bidirectional overrides/isolates and zero-width spaces, which can disguise
 * text. ZWJ/ZWNJ and LRM/RLM are kept: emoji sequences and RTL scripts need them.
 */
const INVISIBLE = /[\u200B\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;

/** Trim, collapse inner whitespace on single-line fields, strip control characters. */
function singleLine(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .replace(INVISIBLE, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function multiLine(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .replace(INVISIBLE, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const enquirySchema = z.object({
  name: z.preprocess(
    singleLine,
    z
      .string({ error: "Enter your name." })
      .min(1, "Enter your name.")
      .max(LIMITS.name, `Name must be ${LIMITS.name} characters or fewer.`),
  ),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z
      .string({ error: "Enter your email address." })
      .min(1, "Enter your email address.")
      .max(LIMITS.email, "Enter a shorter email address.")
      .pipe(z.email({ error: "Enter an email address in the format name@example.com." })),
  ),
  enquiryType: z.enum(ENQUIRY_TYPES, { error: "Choose the type of enquiry." }),
  message: z.preprocess(
    multiLine,
    z
      .string({ error: "Enter your message." })
      .min(1, "Enter your message.")
      .min(LIMITS.messageMin, `Your message must be at least ${LIMITS.messageMin} characters.`)
      .max(LIMITS.message, `Your message must be ${LIMITS.message} characters or fewer.`),
  ),
});

/** Anti-abuse metadata sent alongside the visible fields. */
export const envelopeSchema = z.object({
  /** Honeypot: must be present and empty. */
  website: z.string().max(0),
  /** Epoch ms at which the form was rendered on the client. */
  startedAt: z.number().int().positive(),
  /** Client-generated id; repeat submissions with the same id are deduplicated. */
  idempotencyKey: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryFieldErrors = Partial<Record<keyof Enquiry, string>>;

export function fieldErrors(error: z.ZodError): EnquiryFieldErrors {
  const out: EnquiryFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as keyof Enquiry] = issue.message;
    }
  }
  return out;
}
