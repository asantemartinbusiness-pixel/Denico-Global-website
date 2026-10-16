import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Enquiry, EnquiryType } from "./schema";

export type DeliveryMode = "outbox" | "webhook" | "disabled";

export interface DeliveryConfig {
  mode: DeliveryMode;
  recipients: Record<EnquiryType, string | null>;
  webhookUrl: string | null;
  webhookSecret: string | null;
  outboxDir: string;
}

export interface DeliveryRecord {
  reference: string;
  receivedAt: string;
  to: string;
  enquiry: Enquiry;
}

export type DeliveryResult =
  | { ok: true; mode: "outbox" | "webhook" }
  | { ok: false; reason: "not_configured" | "delivery_failed" };

function readMode(env: NodeJS.ProcessEnv): DeliveryMode {
  const raw = env.ENQUIRY_DELIVERY_MODE?.trim().toLowerCase();
  if (raw === "outbox" || raw === "webhook" || raw === "disabled") return raw;
  // Safe default: local test outbox in development, nothing in production.
  return env.NODE_ENV === "production" ? "disabled" : "outbox";
}

function readEmail(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

export function readDeliveryConfig(env: NodeJS.ProcessEnv = process.env): DeliveryConfig {
  return {
    mode: readMode(env),
    recipients: {
      general: readEmail(env.ENQUIRY_TO_GENERAL),
      press: readEmail(env.ENQUIRY_TO_PRESS),
      studios: readEmail(env.ENQUIRY_TO_STUDIOS),
    },
    webhookUrl: env.ENQUIRY_WEBHOOK_URL?.trim() || null,
    webhookSecret: env.ENQUIRY_WEBHOOK_SECRET?.trim() || null,
    outboxDir: path.resolve(process.cwd(), ".outbox"),
  };
}

/** True when delivery could succeed with the current configuration. */
export function isConfigured(config: DeliveryConfig, type: EnquiryType) {
  if (config.mode === "disabled") return false;
  if (config.mode === "outbox") return true; // outbox records the intended recipient, if any
  return Boolean(config.webhookUrl && config.webhookSecret && config.recipients[type]);
}

export async function deliver(
  config: DeliveryConfig,
  record: Omit<DeliveryRecord, "to">,
  options: { idempotencyKey: string; fetchImpl?: typeof fetch },
): Promise<DeliveryResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const type = record.enquiry.enquiryType;
  if (!isConfigured(config, type)) return { ok: false, reason: "not_configured" };

  const to = config.recipients[type] ?? "(recipient not configured)";
  const payload: DeliveryRecord = { ...record, to };

  if (config.mode === "outbox") {
    try {
      await mkdir(config.outboxDir, { recursive: true });
      await writeFile(
        path.join(config.outboxDir, `${record.reference}.json`),
        JSON.stringify(payload, null, 2),
        { encoding: "utf8", flag: "wx" },
      );
      return { ok: true, mode: "outbox" };
    } catch {
      return { ok: false, reason: "delivery_failed" };
    }
  }

  try {
    const response = await fetchImpl(config.webhookUrl!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.webhookSecret}`,
        // Stable across retries of the same submission, so the receiver can deduplicate.
        "idempotency-key": options.idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true, mode: "webhook" } : { ok: false, reason: "delivery_failed" };
  } catch {
    return { ok: false, reason: "delivery_failed" };
  }
}
