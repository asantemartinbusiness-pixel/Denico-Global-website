# Forms and integrations

## Enquiry form

| Field | Type | Required | Rules | Source |
|---|---|---|---|---|
| Name | text, `autocomplete=name` | Yes | Trimmed, whitespace collapsed, control characters removed, ≤ 120 | Observed |
| Email address | email, `autocomplete=email` | Yes | Trimmed, lower-cased, valid format, ≤ 254 | Observed |
| Type of enquiry | radio: Group and business / Press and media / Denico Studios | Yes | Enum | Reconstructed from the three observed contact channels (OD-06) |
| Message | textarea | Yes | 10–4000 chars, line endings normalised, ≥ 3 blank lines collapsed | Reconstructed (OD-06) |
| `website` | hidden honeypot | Must be empty | aria-hidden, off-screen, `tabindex=-1` | Anti-spam |
| `startedAt` | hidden (JS) | Yes | 2.5 s ≤ age ≤ 6 h | Anti-spam |
| `idempotencyKey` | hidden (JS) | Yes | `[A-Za-z0-9-]{16,64}` | Duplicate handling |

`?enquiry=general|press|studios` preselects the type; any other value is ignored.

## Delivery modes (`ENQUIRY_DELIVERY_MODE`)

| Mode | Behaviour | UI message | Default |
|---|---|---|---|
| `outbox` | Writes `.outbox/<reference>.json` (git-ignored) with the intended recipient. **Sends nothing.** | "Enquiry recorded in test mode … has **not** been delivered to Denico Global" | Development |
| `webhook` | `POST ENQUIRY_WEBHOOK_URL` with `Authorization: Bearer ENQUIRY_WEBHOOK_SECRET`, `Idempotency-Key`, 10 s timeout. Requires the URL, the secret and a recipient for the chosen type, otherwise 503. | "Thank you — your enquiry has been sent" | — |
| `disabled` | 503 | "Online enquiries are not available at the moment. Please email us directly." plus a mailto link | Production |

The webhook is provider-agnostic. It can be connected to an email API (Resend, Postmark, SES), a CRM, or an automation tool. It is the **only** path that sends anything.

### Routing

| Type | Env var | Source-observed value (to confirm) |
|---|---|---|
| general | `ENQUIRY_TO_GENERAL` | info@denicoglobal.com |
| press | `ENQUIRY_TO_PRESS` | press@denicoglobal.com |
| studios | `ENQUIRY_TO_STUDIOS` | studio@denicoglobal.com |

No recipient is hard-coded into delivery: if a value is missing or malformed, that enquiry type returns 503 in webhook mode.

## DEF-001: general enquiries address mismatch

On the original Contact page, the general enquiries link **displayed** `info@denicoglobal.com` while its `mailto:` pointed to a different address. That underlying address was not captured, so it is unknown here. The rebuild makes text and destination identical (`info@denicoglobal.com`), and `journeys.spec.ts` fails if any `mailto:` link's text differs from its target. **Before production:** confirm that info@ is a monitored mailbox and that it is the intended destination (OD-03).

## Abuse and failure handling

| Case | Response |
|---|---|
| Cross-origin `Origin` header | 403 |
| Non-JSON body | 415 |
| Body > 16 KB (declared or streamed) | 413 |
| Rate limit: per client IP (default 5 per 10 min, `ENQUIRY_RATE_LIMIT`) **only** when `ENQUIRY_CLIENT_IP_HEADER` names a platform-set header; otherwise one global bucket (default 30 per 10 min, `ENQUIRY_GLOBAL_RATE_LIMIT`). `X-Forwarded-For` is never trusted. | 429 + `Retry-After` |
| Honeypot filled / too fast / stale | 400 "could not be accepted", **not** a fake success |
| Same idempotency key + same content, or (per-client mode only) same name + email + type + message from the same client within 10 min | 200 with the original reference, `duplicate: true`; delivered once |
| Same idempotency key, different content | 409 "already used — reload to send a new enquiry" |
| Concurrent identical requests | Coalesced into one delivery |
| Delivery not configured / upstream failure | 503 / 502, with an email fallback in the UI |
| Network failure (client) | "We could not reach the server…", values kept, mailto fallback |
| Double click | Client guard + disabled button; one request (tested) |

Logs record only the status and error code, never submitted personal data.

### Production limitations

- The rate limiter and dedupe cache are **process-local**. On serverless or multi-instance hosting, replace them with a shared store (e.g. Redis/Upstash) or put a platform WAF rule in front. Tracked as SEC-04.
- Set `ENQUIRY_CLIENT_IP_HEADER` to the header your platform guarantees (e.g. `cf-connecting-ip`, `x-vercel-forwarded-for`). Never use a header the client can set.
- Consider adding Cloudflare Turnstile if spam appears. It is not added now, because it would bring a third-party script and cookie, with consent implications.

## Integration configuration checklist (before go-live)

- [ ] OD-03: confirm the three recipient mailboxes exist and are monitored
- [ ] Choose a delivery provider; implement the receiver for the webhook contract above
- [ ] Set `ENQUIRY_DELIVERY_MODE=webhook`, `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_SECRET` (secret store, never committed)
- [ ] Send one controlled test enquiry to a **test** recipient, then switch to production recipients
- [ ] Shared rate-limit store, or a WAF rule, if multi-instance
- [ ] OD-08: privacy notice approved and published
