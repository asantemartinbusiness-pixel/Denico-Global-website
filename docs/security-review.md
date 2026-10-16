# Security, privacy and compliance review

**Method.** An independent adversarial review (code reading plus live probing of the production build) was carried out by a reviewer who did not write the code. Its verified findings were fixed, and each fix has a regression test (`tests/unit/handler.test.ts`, "security review regressions"; `tests/unit/rate-limit.test.ts`). The build team then re-probed the fixes (see "Re-verification").

## Findings and resolution

| ID | Severity | Finding (verified by reviewer) | Resolution | Status |
|---|---|---|---|---|
| SEC-A | P2 | The rate limit was keyed on the client-supplied `X-Forwarded-For`. It could be bypassed by rotating the header, or used to lock out a victim by spoofing their IP. With no proxy, all users shared an `"unknown"` bucket. | XFF is no longer trusted. The client IP is read only from a platform header named in `ENQUIRY_CLIENT_IP_HEADER` (e.g. `cf-connecting-ip`). If that is unset, a single global bucket (`ENQUIRY_GLOBAL_RATE_LIMIT`, default 30 per 10 min) applies, and a startup warning is logged in production. | Fixed |
| SEC-B | P2 | Rate-limiter memory was unbounded under key rotation, and pruning cost O(n) on every request. | Hard cap with least-recently-seen eviction; pruning amortised (every 1,000 checks). | Fixed |
| SEC-C | P3 | Content-based dedupe returned another submitter's reference and could silently suppress their enquiry. Reusing an id with new content returned a fake success. | Content dedupe is scoped to the client bucket. Same id with different content → **409**. | Fixed |
| SEC-D | P3 | Concurrent identical submissions were each delivered. The webhook idempotency key changed per attempt. | An in-flight map coalesces concurrent requests into one delivery. The webhook `Idempotency-Key` is stable (client key + content hash). | Fixed |
| SEC-E | P3 | The origin check trusted `X-Forwarded-Host`, and the content-type check used `startsWith` (`application/json-evil` was accepted). | Origin compared with `Host` or the configured site host only. `Sec-Fetch-Site` must be `same-origin`/`none` when present. Exact media-type match. | Fixed |
| SEC-F | P3 | The honeypot was optional, and `startedAt` is client-supplied. | Honeypot now required. The timestamp remains a noise filter **by design**; a signed token or Turnstile is the upgrade path if spam appears. | Partly fixed (accepted) |
| SEC-G | Info | Bidi-override and zero-width characters passed into stored text. | Stripped (U+200B, U+202A–202E, U+2060, U+2066–2069, U+FEFF). ZWJ/ZWNJ/LRM/RLM are kept for emoji and RTL scripts. | Fixed |
| SEC-01 | Info | `npm audit`: 5 high, all the single `braces` advisory (GHSA-vfj7-8cjw-p6xm) via `eslint-config-next` → fast-glob. **Dev-only lint tooling; not shipped.** `npm audit --omit=dev`: **0**. | Track upstream. Do not `--force` (that downgrades to Next 14 tooling). | Accepted |
| SEC-03 | P3 | CSP allows `'unsafe-inline'` for scripts and styles. Next.js static pages emit inline bootstrap scripts, and nonces would force dynamic rendering. | Accepted trade-off. No third-party origins; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri 'self'`; no `unsafe-eval` in production (zod runs jitless). The only `dangerouslySetInnerHTML` is static JSON-LD. Option: hash-based CSP at the edge. | Accepted |
| SEC-04 | P2 (deployment) | Rate limiter, dedupe and in-flight state are process-local. | Must use a shared store or WAF rule on multi-instance or serverless hosting. | Open (deployment) |
| SEC-05 | P3 | If outbox mode were enabled in production, personal data would be written in plaintext to `.outbox/`. | Production default is `disabled`. Outbox is for local testing only; documented. | Accepted |

## Controls in place (verified)

- **Input:** zod validation server-side (authoritative) and client-side (shared schema); length caps; normalisation; CRLF flattening in single-line fields; unknown keys dropped (no prototype pollution).
- **Transport:** 16 KB body cap enforced while streaming (declared and chunked); JSON only; POST only (GET/PUT → 405); `Cache-Control: no-store` on the API.
- **Abuse:** rate limiting, honeypot, minimum fill time, duplicate and concurrency handling.
- **Output:** no stack traces; generic error messages; the client renders server messages as text only; `?enquiry=` is allow-listed.
- **Outbox:** filename derived only from the server-generated reference; written with `wx` (no overwrite); no path traversal.
- **Webhook:** URL and secret from environment only (no SSRF); bearer auth; 10 s timeout.
- **Logging:** status and error code only; never personal data.
- **Headers:** CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS (production), `X-Powered-By` removed, `X-Robots-Tag: noindex` outside production.
- **Secrets:** none in the repository; `.env*` git-ignored except `.env.example`.

## Privacy and compliance

- **Data minimisation:** four fields (name, email, enquiry type, message). No phone, company, address or file upload.
- **No cookies, analytics, tracking or third-party scripts.** So no consent banner is required, and none is shown. If analytics are added, a consent mechanism and an updated notice are required first.
- **Privacy notice:** a draft exists at `/privacy/` (noindex). The controller identity, retention period and governing law **must be completed by legal before launch** (OD-08).
- **Corporate claims:** no regulated financial promotion, investment invitation, performance figure, ownership percentage, certification or regulatory permission appears anywhere. Portfolio content is limited to registry-confirmed entities.
- **Public repository hygiene:** internal Denico doctrine and internal entity names are not reproduced (verified by grep during the content review).

## Re-verification

See `qa-results.md` § "Post-fix verification" for the re-probe results after the fixes.
