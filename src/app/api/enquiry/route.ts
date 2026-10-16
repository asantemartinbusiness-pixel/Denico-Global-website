import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/content/site";
import { readDeliveryConfig } from "@/lib/enquiry/delivery";
import {
  handleEnquiry,
  MAX_BODY_BYTES,
  type EnquiryResponse,
  type EnquiryResponseBody,
  type RecentEntry,
} from "@/lib/enquiry/handler";
import { RateLimiter, RecentResults } from "@/lib/enquiry/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;

/**
 * Header set by the hosting platform that carries the real client IP
 * (e.g. "cf-connecting-ip", "x-real-ip", "x-vercel-forwarded-for").
 * It must be a header the platform overwrites; never trust a value the client
 * can supply. When unset, all clients share one global bucket.
 */
const CLIENT_IP_HEADER = process.env.ENQUIRY_CLIENT_IP_HEADER?.trim().toLowerCase() || null;
const PER_CLIENT_LIMIT = Math.max(1, Number(process.env.ENQUIRY_RATE_LIMIT) || 5);
const GLOBAL_LIMIT = Math.max(1, Number(process.env.ENQUIRY_GLOBAL_RATE_LIMIT) || 30);

if (!CLIENT_IP_HEADER && process.env.NODE_ENV === "production") {
  console.warn("[enquiry] ENQUIRY_CLIENT_IP_HEADER not set; using a single global rate-limit bucket.");
}

// Process-local state. See docs/forms-and-integrations.md for multi-instance hosting.
const limiter = new RateLimiter(CLIENT_IP_HEADER ? PER_CLIENT_LIMIT : GLOBAL_LIMIT, WINDOW_MS);
const recent = new RecentResults<RecentEntry>(WINDOW_MS);
const inFlight = new Map<string, Promise<EnquiryResponse>>();
const allowedHosts = [new URL(site.url).host];

function clientKey(request: NextRequest) {
  if (!CLIENT_IP_HEADER) return "global";
  const value = request.headers.get(CLIENT_IP_HEADER)?.split(",")[0]?.trim();
  return value ? `ip:${value}` : "ip:unknown";
}

/** Reads the body as text, giving up once it exceeds `limit` bytes. */
async function readCapped(request: NextRequest, limit: number): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > limit) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(request: NextRequest) {
  const rawBody = await readCapped(request, MAX_BODY_BYTES);
  if (rawBody === null) {
    const body: EnquiryResponseBody = {
      ok: false,
      error: "too_large",
      message: "Your message is too long. Please shorten it and try again.",
    };
    return NextResponse.json(body, { status: 413 });
  }

  const result = await handleEnquiry(
    {
      rawBody,
      contentType: request.headers.get("content-type"),
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      fetchSite: request.headers.get("sec-fetch-site"),
      clientKey: clientKey(request),
    },
    { config: readDeliveryConfig(), limiter, recent, inFlight, allowedHosts },
  );

  if (!result.body.ok && result.status >= 500) {
    // Log the outcome only — never the submitted personal data.
    console.warn(`[enquiry] ${result.status} ${result.body.error}`);
  }

  return NextResponse.json(result.body, { status: result.status, headers: result.headers });
}

export function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
