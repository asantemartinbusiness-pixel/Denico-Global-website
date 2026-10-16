# SEO and redirects

## Implemented

| Element | Implementation | Verified by |
|---|---|---|
| Page titles | Unique per page, `<Page> \| Denico Global` | `seo.spec.ts` |
| Meta descriptions | Unique, 50–170 characters | `seo.spec.ts` |
| Canonical URLs | Per page, absolute, from `NEXT_PUBLIC_SITE_URL` (default `https://denicoglobal.com`) | `seo.spec.ts` |
| Open Graph / Twitter | Title, description, URL, `en_GB`, 1200×630 image | `seo.spec.ts` |
| Structured data | `Organization` JSON-LD on the homepage (name, url, description, email) | `seo.spec.ts` |
| Sitemap | `/sitemap.xml`: the 5 public pages | `seo.spec.ts` |
| Robots | `SITE_ENV=production`: allow, `Disallow: /api/`, sitemap link. **Anything else: `Disallow: /`, `X-Robots-Tag: noindex, nofollow`, and `<meta name="robots" content="noindex">`** | `seo.spec.ts`; manual |
| Real 404s | Status 404 for unknown routes, with a noindex 404 page | `journeys.spec.ts` |
| Heading semantics | One `h1` per page, no skipped levels | `accessibility.spec.ts` |
| Trailing slashes | `/path` → 308 → `/path/`, matching WordPress URLs | `journeys.spec.ts` |

Lighthouse SEO: **100** (home, contact) on a `SITE_ENV=production` build. **66** on the default build, as intended: it is blocked from indexing (`docs/evidence/lighthouse-summary.txt`).

The canonical domain (`https://denicoglobal.com`, apex, no `www`) is an assumption. The original canonical setting was not observed (OD-13).

## Redirects

### Implemented

| From | To | Code | Reason |
|---|---|---|---|
| `/feed/` | `/` | 308 | WordPress default feed; the rebuild publishes no feed |
| `/<path>` (no slash) | `/<path>/` | 308 | URL continuity |

### Proposed, requiring approval (not implemented)

| ID | From | To | Code | Rationale |
|---|---|---|---|---|
| OD-09 | `/companies-2/` | `/portfolio/` | 308 | "companies-2" is an auto-generated WordPress slug. `/portfolio/` is clearer, and the 308 preserves link equity. If approved: move `src/app/companies-2` → `src/app/portfolio`, add the redirect in `next.config.ts`, update the content links, sitemap and tests. |
| OD-10 | `/zara-madid-speaking-about-her-influence-and-creative-vision/` | — | 410 | Tells search engines that the demonstration post is gone permanently (currently 404). Implement at the host or edge. |
| — | `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php` | — | 404 (default) | Leave as 404. Do not redirect, so probes get nothing. |
| — | `/?p=<id>`, `/category/*`, `/author/*`, `/tag/*` | — | 404 | No such archives were observed. Add specific redirects only if a recovered export shows that indexed URLs exist. |

## Launch checklist

- [ ] Confirm the canonical domain and `www` behaviour (OD-13)
- [ ] Build with `SITE_ENV=production` **only** for the production deployment; previews keep the default
- [ ] Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools
- [ ] After DNS cutover, inspect old URLs for 200 / 308 / 404 / 410 as planned
- [ ] Replace the provisional OG image once the brand is recovered
