import { createHash, randomBytes } from "node:crypto";
import { deliver, type DeliveryConfig } from "./delivery";
import {
  enquirySchema,
  envelopeSchema,
  fieldErrors,
  MAX_FORM_AGE_MS,
  MIN_FILL_TIME_MS,
  type EnquiryFieldErrors,
} from "./schema";
import { RateLimiter, RecentResults } from "./rate-limit";

export const MAX_BODY_BYTES = 16 * 1024;

type ErrorCode =
  | "invalid"
  | "rejected"
  | "forbidden"
  | "too_large"
  | "unsupported"
  | "rate_limited"
  | "conflict"
  | "unavailable"
  | "delivery_failed";

export type EnquiryResponseBody =
  | { ok: true; reference: string; mode: "test" | "live"; duplicate: boolean }
  | { ok: false; error: ErrorCode; message: string; fieldErrors?: EnquiryFieldErrors };

export interface EnquiryRequest {
  rawBody: string;
  contentType: string | null;
  origin: string | null;
  /** Value of the Host header. X-Forwarded-Host is deliberately not trusted. */
  host: string | null;
  /** Sec-Fetch-Site, when the browser sends it. */
  fetchSite: string | null;
  /** Rate-limit bucket: a trusted client IP, or "global" when none is configured. */
  clientKey: string;
  now?: number;
}

export interface EnquiryResponse {
  status: number;
  body: EnquiryResponseBody;
  headers?: Record<string, string>;
}

export interface RecentEntry {
  reference: string;
  mode: "test" | "live";
  contentHash: string;
}

export interface EnquiryDeps {
  config: DeliveryConfig;
  limiter: RateLimiter;
  recent: RecentResults<RecentEntry>;
  /** Requests being delivered right now, so concurrent duplicates share one delivery. */
  inFlight?: Map<string, Promise<EnquiryResponse>>;
  /** Additional hosts accepted in the Origin header (e.g. the configured site host). */
  allowedHosts?: string[];
  fetchImpl?: typeof fetch;
  newReference?: (now: number) => string;
}

export function createReference(now: number) {
  const date = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
  return `DG-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const REJECTED = "Your enquiry could not be accepted. Please reload the page and try again, or email us directly.";

function fail(
  status: number,
  error: ErrorCode,
  message: string,
  extra: { fieldErrors?: EnquiryFieldErrors } = {},
  headers?: Record<string, string>,
): EnquiryResponse {
  return { status, body: { ok: false, error, message, ...extra }, headers };
}

function originAllowed(req: EnquiryRequest, allowedHosts: string[]) {
  if (req.fetchSite && req.fetchSite !== "same-origin" && req.fetchSite !== "none") return false;
  if (!req.origin) return true; // non-browser clients; the other controls still apply
  try {
    const originHost = new URL(req.origin).host;
    return originHost === req.host || allowedHosts.includes(originHost);
  } catch {
    return false;
  }
}

function isJson(contentType: string | null) {
  return contentType?.split(";")[0]?.trim().toLowerCase() === "application/json";
}

export async function handleEnquiry(req: EnquiryRequest, deps: EnquiryDeps): Promise<EnquiryResponse> {
  const now = req.now ?? Date.now();

  if (!originAllowed(req, deps.allowedHosts ?? [])) {
    return fail(403, "forbidden", "This request was not accepted.");
  }
  if (!isJson(req.contentType)) {
    return fail(415, "unsupported", "This request was not accepted.");
  }
  if (Buffer.byteLength(req.rawBody, "utf8") > MAX_BODY_BYTES) {
    return fail(413, "too_large", "Your message is too long. Please shorten it and try again.");
  }

  const rate = deps.limiter.check(sha256(req.clientKey), now);
  if (!rate.allowed) {
    return fail(
      429,
      "rate_limited",
      "Too many enquiries have been sent recently. Please wait a few minutes and try again, or email us directly.",
      {},
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(req.rawBody);
  } catch {
    return fail(400, "invalid", "We could not read your enquiry. Please try again.");
  }
  const raw = (json !== null && typeof json === "object" ? json : {}) as Record<string, unknown>;

  const envelope = envelopeSchema.safeParse(raw);
  if (!envelope.success) return fail(400, "rejected", REJECTED);
  const age = now - envelope.data.startedAt;
  if (age < MIN_FILL_TIME_MS || age > MAX_FORM_AGE_MS) return fail(400, "rejected", REJECTED);

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return fail(400, "invalid", "Please correct the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  }
  const enquiry = parsed.data;
  const idempotencyKey = envelope.data.idempotencyKey;

  // Duplicate handling. Content matches are scoped to the same client so one
  // visitor can never learn, or suppress, another visitor's enquiry.
  const contentHash = sha256(`${enquiry.email}\n${enquiry.enquiryType}\n${enquiry.message}`);
  const keyId = `id:${idempotencyKey}`;
  const keyContent = `content:${sha256(req.clientKey)}:${contentHash}`;

  const byId = deps.recent.get(keyId, now);
  if (byId) {
    if (byId.contentHash !== contentHash) {
      return fail(409, "conflict", "This form has already been used. Please reload the page to send a new enquiry.");
    }
    return { status: 200, body: { ok: true, reference: byId.reference, mode: byId.mode, duplicate: true } };
  }
  const byContent = deps.recent.get(keyContent, now);
  if (byContent) {
    return { status: 200, body: { ok: true, reference: byContent.reference, mode: byContent.mode, duplicate: true } };
  }

  const inFlight = deps.inFlight;
  const pending = inFlight?.get(keyId) ?? inFlight?.get(keyContent);
  if (pending) {
    const settled = await pending;
    return settled.body.ok ? { ...settled, body: { ...settled.body, duplicate: true } } : settled;
  }

  const work = (async (): Promise<EnquiryResponse> => {
    const reference = (deps.newReference ?? createReference)(now);
    const result = await deliver(
      deps.config,
      { reference, receivedAt: new Date(now).toISOString(), enquiry },
      { idempotencyKey: `${idempotencyKey}:${contentHash.slice(0, 16)}`, fetchImpl: deps.fetchImpl },
    );

    if (!result.ok) {
      return result.reason === "not_configured"
        ? fail(503, "unavailable", "Online enquiries are not available at the moment. Please email us directly.")
        : fail(502, "delivery_failed", "Your enquiry could not be sent. Please try again, or email us directly.");
    }

    const mode = result.mode === "outbox" ? "test" : "live";
    const entry: RecentEntry = { reference, mode, contentHash };
    deps.recent.set(keyId, entry, now);
    deps.recent.set(keyContent, entry, now);
    return { status: 200, body: { ok: true, reference, mode, duplicate: false } };
  })();

  inFlight?.set(keyId, work);
  inFlight?.set(keyContent, work);
  try {
    return await work;
  } finally {
    inFlight?.delete(keyId);
    inFlight?.delete(keyContent);
  }
}
