# Architecture

## Decision summary

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16.4 (App Router), React 19.3 | Static generation for every public page, one secure server route for the form, mature metadata/SEO APIs |
| Language | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` | TS 7.0 is too new to rely on with Next 16; 5.9 is the proven line |
| Styling | CSS Modules + global design tokens (CSS custom properties) | No runtime cost, no utility-class sprawl, one file to swap the brand |
| Content | Typed TypeScript modules in `src/content/` with per-block provenance | See "Content management" below |
| Validation | zod 4 (jitless), shared by client and server | One schema, so client and server can't drift. Jitless keeps the CSP free of `unsafe-eval`. |
| Forms | Route handler `POST /api/enquiry/` with pluggable delivery | Never fakes success; testable without credentials |
| Tests | Vitest (unit), Playwright 1.56 + axe-core (E2E, accessibility, visual) | Playwright 1.56 matches the preinstalled Chromium build |
| Hosting | Not chosen (OD-12). Any Node 20+ host, or a static host plus a separate form function | Deployment is outside this mandate |

Client JavaScript is limited to three islands: the header (mobile menu, active link), the hero slider, and the contact form. Everything else is server-rendered HTML.

## Directory layout

```
src/
  app/                    routes (App Router)
    page.tsx              /
    our-story/ inside-denico/ companies-2/ contact/ privacy/
    api/enquiry/route.ts  POST handler: body cap, IP extraction, delegates to lib
    sitemap.ts robots.ts opengraph-image.tsx icon.svg not-found.tsx
    globals.css           design tokens + base styles
  components/             presentational components (+ .module.css)
  content/                ALL public copy, typed, with provenance
    types.ts site.ts pages.ts
  lib/
    seo.ts                metadata builder, JSON-LD, indexability switch
    enquiry/              schema, handler (pure), delivery adapters, rate limiter
tests/
  unit/                   handler, schema, rate limiter
  e2e/                    journeys, navigation, slider, contact, a11y, seo, links, visual
docs/                     this review package
```

## Request flow: enquiry

```
ContactForm (client)
  └─ zod validation → error summary / inline errors
  └─ POST /api/enquiry/  {fields, website(honeypot), startedAt, idempotencyKey}
       route.ts: stream body with a 16 KB cap → 413
       handler.ts (pure, unit-tested):
         same-origin check → 403
         JSON content type → 415
         origin = Host/site host; Sec-Fetch-Site same-origin → 403
         rate limit: trusted platform IP header, else global bucket → 429
         envelope: honeypot empty, 2.5 s ≤ age ≤ 6 h → 400 rejected
         schema validation + normalisation → 400 with fieldErrors
         dedupe: idempotency key (409 if reused with new content), per-client
           content hash, in-flight coalescing → 200 duplicate
         deliver(): outbox | webhook | disabled
           not configured → 503   upstream failure → 502
       → 200 {reference, mode: "test" | "live"}
  └─ UI states: success (test mode stated explicitly) | error + mailto fallback
```

## Content management

**Recommendation for now: keep content in Git (typed modules), with no CMS.**

- The site has five pages that change rarely, and its copy needs founder approval anyway. A CMS would add authentication, hosting, cost and an attack surface with no current editorial need.
- Typed content gives review-mode provenance, diffable history (Git is the revision log), and approval through pull requests.

**Upgrade path, if Denico starts publishing news or adds portfolio companies frequently:**

| Option | Fit | Notes |
|---|---|---|
| Keystatic or TinaCMS (Git-backed) | Best next step | Keeps content in the repo; adds an editor UI and preview; no database |
| Sanity / Contentful (hosted headless) | Good for a larger editorial team | Roles, scheduled publishing, image CDN; recurring cost; requires ISR or webhooks |
| Payload CMS (self-hosted, TypeScript) | Good if Denico wants to own the stack | Needs a database and hosting |
| WordPress (headless or traditional) | Not recommended | Brings back the maintenance and security burden that preceded the outage |

The `PortfolioEntity` and `TextSection` types in `src/content/types.ts` are already the content model any of these would implement.

## Configuration

All configuration comes from environment variables; see `.env.example`. Key switches: `SITE_ENV` (indexing), `ENQUIRY_DELIVERY_MODE`, `ENQUIRY_TO_*`, `NEXT_PUBLIC_REVIEW_MODE`, `ENQUIRY_RATE_LIMIT`.
