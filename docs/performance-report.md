# Performance report

All figures are **measured**, not estimated. Raw output: `docs/evidence/lighthouse-summary.txt`.

## Test conditions

- **Build:** `next build` production output served by `next start` on localhost (no CDN, no compression proxy, no HTTP/2).
- **Tool:** Lighthouse 13.5.0, headless Chromium 141 (build 1194).
- **Mobile:** Lighthouse default simulated throttling (slow 4G, 4× CPU slowdown, Moto G-class viewport).
- **Desktop:** `--preset=desktop`.
- **Date:** 16 October 2026. Run in a shared cloud container, so CPU contention makes TBT vary by roughly ±100 ms between runs.
- **Run count:** single run per page and form factor (a run that returned no metrics was repeated).

## Results (final build)

| Page | Mobile perf | LCP | CLS | TBT | Desktop perf | Desktop LCP | Transfer |
|---|---|---|---|---|---|---|---|
| Home | 98 | 2.3 s | 0 | 70 ms | 100 | 0.5 s | 238 KiB |
| Our Story | 99 | 2.2 s | 0 | 60 ms | 100 | 0.5 s | 221 KiB |
| Inside Denico | 97 | 2.4 s | 0 | 130 ms | 100 | 0.5 s | 221 KiB |
| Portfolio | 97 | 2.5 s | 0 | 70 ms | 100 | 0.5 s | 221 KiB |
| Contact | 95 | 2.3 s | 0 | 210 ms | 100 | 0.6 s | 255 KiB |

Lighthouse **Accessibility: 100** and **Best Practices: 100** on every page, both form factors.
Lighthouse **SEO: 66** on this build, by design: it is noindexed. A `SITE_ENV=production` build scores **100** (home, contact).

## Against targets

| Target | Result |
|---|---|
| LCP ≤ 2.5 s | Met on all pages under simulated mobile; Portfolio is at the limit (2.5 s). Desktop 0.5–0.6 s. |
| CLS ≤ 0.1 | **0** everywhere (`next/font` size-adjusted fallback, no images). |
| INP ≤ 200 ms | **Not measurable in the lab.** INP needs real user interactions (field data). Lab proxy: TBT 60–210 ms on throttled mobile, 0–10 ms on desktop. Contact (zod + form island) is the heaviest. Measure field INP after launch. |
| Lighthouse Performance ≥ 90 | Met: 95–99 mobile, 100 desktop. |
| Lighthouse Accessibility ≥ 95 | Met: 100, backed by manual-equivalent review (`accessibility-report.md`). |

## What makes it fast

- Every public page is statically generated. Only `/api/enquiry/` runs on the server.
- Three small client islands (header, slider, form); everything else ships as HTML.
- One self-hosted 50 KB variable font (preloaded, `display: swap`, metric-matched fallback). Body text uses system fonts.
- No images, no third-party scripts, no analytics, no tag manager.

## Improvement opportunities (not done; diminishing returns)

- **Lighthouse "unused JavaScript", ~27–53 KiB:** mostly the React/Next runtime. Could be reduced by lazy-loading the slider island below a static first slide.
- **Render-blocking CSS, ~150 ms estimated:** Next's per-route CSS chunks. Inlining critical CSS is possible but adds build complexity.
- **Behind a CDN:** Brotli plus edge caching of static HTML will cut TTFB and transfer considerably compared with these localhost numbers.
- **When photography is recovered:** use `next/image` (AVIF/WebP, responsive `sizes`) and keep the hero image out of the critical LCP path, or preload it.
