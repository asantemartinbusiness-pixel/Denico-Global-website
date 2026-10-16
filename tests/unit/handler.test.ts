import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readDeliveryConfig, type DeliveryConfig } from "@/lib/enquiry/delivery";
import {
  handleEnquiry,
  type EnquiryDeps,
  type EnquiryRequest,
  type EnquiryResponse,
  type RecentEntry,
} from "@/lib/enquiry/handler";
import { RateLimiter, RecentResults } from "@/lib/enquiry/rate-limit";

const NOW = Date.UTC(2026, 9, 16, 12, 0, 0);
let outboxDir: string;

function config(overrides: Partial<DeliveryConfig> = {}): DeliveryConfig {
  return {
    mode: "outbox",
    recipients: { general: "info@example.test", press: "press@example.test", studios: "studio@example.test" },
    webhookUrl: null,
    webhookSecret: null,
    outboxDir,
    ...overrides,
  };
}

function deps(overrides: Partial<EnquiryDeps> = {}): EnquiryDeps {
  let n = 0;
  return {
    config: config(),
    limiter: new RateLimiter(5, 600_000),
    recent: new RecentResults<RecentEntry>(600_000),
    inFlight: new Map<string, Promise<EnquiryResponse>>(),
    newReference: () => `DG-TEST-${++n}`,
    ...overrides,
  };
}

function request(body: Record<string, unknown> = {}, overrides: Partial<EnquiryRequest> = {}): EnquiryRequest {
  return {
    rawBody: JSON.stringify({
      name: "Ada Lovelace",
      email: "ada@example.com",
      enquiryType: "general",
      message: "I would like to discuss a business matter.",
      website: "",
      startedAt: NOW - 10_000,
      idempotencyKey: "0f6e1a7c-1111-4222-8333-444455556666",
      ...body,
    }),
    contentType: "application/json",
    origin: "http://localhost:3000",
    host: "localhost:3000",
    fetchSite: "same-origin",
    clientKey: "ip:203.0.113.7",
    now: NOW,
    ...overrides,
  };
}

beforeEach(async () => {
  outboxDir = await mkdtemp(path.join(tmpdir(), "denico-outbox-"));
});

afterEach(async () => {
  await rm(outboxDir, { recursive: true, force: true });
});

describe("handleEnquiry", () => {
  it("accepts a valid enquiry in test mode and writes it to the outbox with the routed recipient", async () => {
    const res = await handleEnquiry(request({ enquiryType: "press" }), deps());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, reference: "DG-TEST-1", mode: "test", duplicate: false });
    const files = await readdir(outboxDir);
    expect(files).toEqual(["DG-TEST-1.json"]);
    const saved = JSON.parse(await readFile(path.join(outboxDir, files[0]!), "utf8"));
    expect(saved.to).toBe("press@example.test");
    expect(saved.enquiry.email).toBe("ada@example.com");
  });

  it("returns field errors for invalid input without delivering", async () => {
    const res = await handleEnquiry(request({ email: "nope" }), deps());
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: "invalid", fieldErrors: { email: expect.any(String) } });
    expect(await readdir(outboxDir)).toEqual([]);
  });

  it("rejects honeypot, too-fast and stale submissions without claiming success", async () => {
    for (const body of [{ website: "http://spam" }, { startedAt: NOW - 500 }, { startedAt: NOW - 25 * 3600_000 }]) {
      const res = await handleEnquiry(request(body), deps());
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ ok: false, error: "rejected" });
    }
    expect(await readdir(outboxDir)).toEqual([]);
  });

  it("rejects cross-origin requests and non-JSON bodies", async () => {
    expect((await handleEnquiry(request({}, { origin: "https://evil.example" }), deps())).status).toBe(403);
    expect((await handleEnquiry(request({}, { contentType: "text/plain" }), deps())).status).toBe(415);
    expect((await handleEnquiry(request({}, { rawBody: "{not json" }), deps())).status).toBe(400);
  });

  it("deduplicates repeated submissions by id and by content", async () => {
    const d = deps();
    const first = await handleEnquiry(request(), d);
    const sameId = await handleEnquiry(request(), d);
    const sameContent = await handleEnquiry(request({ idempotencyKey: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" }), d);
    expect(first.body).toMatchObject({ ok: true, duplicate: false, reference: "DG-TEST-1" });
    expect(sameId.body).toMatchObject({ ok: true, duplicate: true, reference: "DG-TEST-1" });
    expect(sameContent.body).toMatchObject({ ok: true, duplicate: true, reference: "DG-TEST-1" });
    expect(await readdir(outboxDir)).toHaveLength(1);
  });

  it("rate limits per client and sends Retry-After", async () => {
    const d = deps({ limiter: new RateLimiter(1, 600_000) });
    await handleEnquiry(request(), d);
    const res = await handleEnquiry(request({ message: "A different message entirely." }), d);
    expect(res.status).toBe(429);
    expect(res.headers?.["Retry-After"]).toBeDefined();
  });

  it("reports unavailable (503) when delivery is disabled — never a false success", async () => {
    const res = await handleEnquiry(request(), deps({ config: config({ mode: "disabled" }) }));
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ ok: false, error: "unavailable" });
  });

  it("requires a webhook URL, secret and recipient before using webhook mode", async () => {
    const res = await handleEnquiry(request(), deps({ config: config({ mode: "webhook" }) }));
    expect(res.status).toBe(503);
  });

  it("posts to the webhook with auth and reports upstream failure as 502", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const d = deps({
      config: config({ mode: "webhook", webhookUrl: "https://hooks.example.test/enquiry", webhookSecret: "s3cret" }),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const failed = await handleEnquiry(request(), d);
    expect(failed.status).toBe(502);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.example.test/enquiry");
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer s3cret");
    // Stable per submission (client key + content), not a fresh reference per attempt.
    expect(headers["idempotency-key"]).toMatch(/^0f6e1a7c-1111-4222-8333-444455556666:[0-9a-f]{16}$/);

    fetchImpl.mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sent = await handleEnquiry(request({ idempotencyKey: "bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee" }), d);
    expect(sent.body).toMatchObject({ ok: true, mode: "live" });
  });
});

describe("handleEnquiry — security review regressions", () => {
  it("SEC-C: reusing an idempotency key with different content is a conflict, not a silent success", async () => {
    const d = deps();
    await handleEnquiry(request(), d);
    const res = await handleEnquiry(request({ message: "Completely different content here." }), d);
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ ok: false, error: "conflict" });
  });

  it("SEC-C: identical content from a different client is delivered separately and never echoes the other reference", async () => {
    const d = deps();
    const first = await handleEnquiry(request(), d);
    const other = await handleEnquiry(
      request({ idempotencyKey: "cccccccc-bbbb-4ccc-8ddd-eeeeeeeeeeee" }, { clientKey: "ip:198.51.100.1" }),
      d,
    );
    expect(first.body).toMatchObject({ reference: "DG-TEST-1" });
    expect(other.body).toMatchObject({ ok: true, duplicate: false, reference: "DG-TEST-2" });
    expect(await readdir(outboxDir)).toHaveLength(2);
  });

  it("SEC-C: in the shared global bucket, identical content from another submission is never matched", async () => {
    const d = deps();
    await handleEnquiry(request({}, { clientKey: "global" }), d);
    const other = await handleEnquiry(
      request({ idempotencyKey: "eeeeeeee-bbbb-4ccc-8ddd-eeeeeeeeeeee" }, { clientKey: "global" }),
      d,
    );
    expect(other.body).toMatchObject({ ok: true, duplicate: false, reference: "DG-TEST-2" });
  });

  it("SEC-D: concurrent identical submissions are delivered once", async () => {
    const d = deps();
    const results = await Promise.all(Array.from({ length: 5 }, () => handleEnquiry(request(), d)));
    expect(new Set(results.map((r) => (r.body.ok ? r.body.reference : r.body.error)))).toEqual(new Set(["DG-TEST-1"]));
    expect(results.filter((r) => r.body.ok && !r.body.duplicate)).toHaveLength(1);
    expect(await readdir(outboxDir)).toHaveLength(1);
  });

  it("SEC-E: the Origin must match the Host header or a configured host; cross-site fetches are refused", async () => {
    const d = deps({ allowedHosts: ["denicoglobal.com"] });
    expect((await handleEnquiry(request({}, { origin: "https://evil.com", host: "evil.com" }), d)).status).toBe(200);
    // X-Forwarded-Host is not an input any more, so spoofing it has no effect; only Host counts.
    expect((await handleEnquiry(request({}, { origin: "https://evil.com" }), d)).status).toBe(403);
    expect((await handleEnquiry(request({}, { origin: "https://denicoglobal.com" }), deps())).status).toBe(403);
    expect(
      (await handleEnquiry(request({ idempotencyKey: "dddddddd-bbbb-4ccc-8ddd-eeeeeeeeeeee" }, { origin: "https://denicoglobal.com" }), d)).status,
    ).toBe(200);
    expect((await handleEnquiry(request({}, { fetchSite: "cross-site" }), deps())).status).toBe(403);
  });

  it("SEC-E: only the exact application/json media type is accepted", async () => {
    expect((await handleEnquiry(request({}, { contentType: "application/json-evil" }), deps())).status).toBe(415);
    expect((await handleEnquiry(request({}, { contentType: "application/json; charset=utf-8" }), deps())).status).toBe(200);
  });

  it("SEC-F: the honeypot field must be present", async () => {
    const body = JSON.parse(request().rawBody);
    delete body.website;
    const res = await handleEnquiry(request({}, { rawBody: JSON.stringify(body) }), deps());
    expect(res.body).toMatchObject({ ok: false, error: "rejected" });
  });
});

describe("readDeliveryConfig", () => {
  it("defaults to disabled in production and outbox elsewhere", () => {
    expect(readDeliveryConfig({ NODE_ENV: "production" } as NodeJS.ProcessEnv).mode).toBe("disabled");
    expect(readDeliveryConfig({ NODE_ENV: "development" } as NodeJS.ProcessEnv).mode).toBe("outbox");
  });

  it("ignores malformed recipient addresses", () => {
    const cfg = readDeliveryConfig({ NODE_ENV: "test", ENQUIRY_TO_GENERAL: "not an email" } as NodeJS.ProcessEnv);
    expect(cfg.recipients.general).toBeNull();
  });
});
