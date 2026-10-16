# Denico Global — corporate website (reconstruction)

A local reconstruction of the Denico Global corporate website, prepared for executive review. **Not deployed.** Nothing in this repository is live.

> **Read first:** [`docs/release-readiness.md`](docs/release-readiness.md) (recommendation and blockers) and [`docs/open-decisions.md`](docs/open-decisions.md) (what needs approval).

## Why this is a reconstruction rather than a copy

The original denicoglobal.com **could not be retrieved**: the domain no longer resolves, archive services were unreachable from the build environment, and no WordPress export, database or brand files were supplied. The site was therefore rebuilt from:

1. what the commissioning brief recorded about the live site (page titles, positioning, contact details, routes);
2. Denico's own entity records, used to confirm which companies may be named;
3. new copy written from that positioning, **labelled as reconstructed and pending approval**.

Nothing has been invented: no companies, people, figures, offices or claims. The logo, palette and typefaces are **provisional**. Full evidence is in [`docs/source-evidence.md`](docs/source-evidence.md).

## Pages

| Route | Page |
|---|---|
| `/` | Home: hero slider, overview, principles, pathways |
| `/our-story/` | Our Story: Our Approach, Our Focus |
| `/inside-denico/` | Inside Denico Global: structure, oversight and independence, Denico Studios |
| `/companies-2/` | Group Portfolio Overview (legacy slug preserved) |
| `/contact/` | Contact: enquiry form, directory, hours |
| `/privacy/` | Privacy notice (**draft**, noindex) |

## Quick start

Requirements: Node.js 20.9+ (tested on 22).

```bash
npm ci
cp .env.example .env.local     # defaults are safe: local outbox, no indexing
npm run dev                    # http://localhost:3000
```

Production build and full verification:

```bash
npm run check                  # typecheck + lint + unit tests + production build
npx playwright test            # E2E, accessibility, SEO, links, visual (needs a build first)
```

Content review mode shows the provenance of every block on the page:

```bash
NEXT_PUBLIC_REVIEW_MODE=1 npm run build && npm start
```

### Enquiry form behaviour

By default (development, or `ENQUIRY_DELIVERY_MODE=outbox`), submissions are written to `.outbox/*.json` and **never sent**. The confirmation tells the visitor this explicitly. In production the default is `disabled` (honest "not available" message plus email links) until a delivery webhook is configured. See [`docs/forms-and-integrations.md`](docs/forms-and-integrations.md).

## Stack

Next.js 16.4 (App Router, static generation) · React 19.3 · TypeScript 5.9 strict · CSS Modules + design tokens · zod 4 · Vitest · Playwright 1.56 + axe-core. Rationale: [`docs/architecture.md`](docs/architecture.md).

## Editing content

All public copy lives in `src/content/` (`site.ts`, `pages.ts`). Each block records where it came from (`observed`, `registry`, `reconstructed`). After approving or replacing a block, update its `provenance` and run `npm run check`.

To apply the recovered brand: replace the tokens at the top of `src/app/globals.css`, the wordmark in `src/components/Wordmark.tsx`, and the display font in `src/app/layout.tsx`.

## Documentation

| Document | Purpose |
|---|---|
| [release-readiness](docs/release-readiness.md) | Recommendation, completion matrix, blockers |
| [open-decisions](docs/open-decisions.md) | Every decision that needs a human |
| [defect-register](docs/defect-register.md) | All defects found, with severity and status |
| [source-evidence](docs/source-evidence.md) · [original-site-inventory](docs/original-site-inventory.md) · [source-inventory](docs/source-inventory.md) · [missing-content-register](docs/missing-content-register.md) | Recovery evidence and provenance |
| [route-manifest](docs/route-manifest.md) · [navigation-map](docs/navigation-map.md) · [seo-and-redirects](docs/seo-and-redirects.md) | Structure and URL continuity |
| [content-migration](docs/content-migration.md) · [asset-manifest](docs/asset-manifest.md) | Content and assets |
| [architecture](docs/architecture.md) · [forms-and-integrations](docs/forms-and-integrations.md) | Engineering |
| [accessibility-report](docs/accessibility-report.md) · [security-review](docs/security-review.md) · [performance-report](docs/performance-report.md) · [visual-audit](docs/visual-audit.md) · [qa-results](docs/qa-results.md) | Verification |
| [`docs/evidence/`](docs/evidence/) | Raw test and Lighthouse output |

## Boundaries

This repository does not deploy, change DNS, send enquiries to real recipients, or modify the original WordPress site. Deployment follows approval (Draft → Review → Approve → Execute).
