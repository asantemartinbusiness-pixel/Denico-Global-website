# Route manifest

All routes the rebuilt application serves. `trailingSlash: true` preserves the WordPress URL shape: `/our-story` returns a 308 redirect to `/our-story/`.

| Route | Source URL | Type | Render | Status | Indexed (prod) | Confidence | Reconstruction status |
|---|---|---|---|---|---|---|---|
| `/` | `/` | Home | Static | 200 | Yes | Partially verified | Complete; copy pending approval |
| `/our-story/` | `/our-story/` | Page | Static | 200 | Yes | Partially verified | Complete; body copy pending approval |
| `/inside-denico/` | `/inside-denico/` | Page | Static | 200 | Yes | Unverified (content) | Complete; reconstructed content pending approval |
| `/companies-2/` | `/companies-2/` | Portfolio overview | Static | 200 | Yes | Unverified (content) | Complete; legacy slug preserved (OD-09) |
| `/companies-2/#denico-studios` | n/a | In-page profile anchor | Static | 200 | n/a | Registry | Complete |
| `/contact/` | `/contact/` | Contact + form | Static | 200 | Yes | Verified (structure) | Complete; delivery pending configuration (OD-03) |
| `/contact/?enquiry={general\|press\|studios}` | n/a | Preselects enquiry type | Static + client | 200 | Canonical → `/contact/` | n/a | Complete |
| `/privacy/` | none observed | Legal (draft) | Static | 200 | **No** (noindex, excluded from sitemap) | Reconstructed | Draft (OD-08) |
| `/api/enquiry/` | WP form handler (unknown) | API, POST only | Dynamic (Node) | 200/400/403/413/415/429/502/503; GET → 405 | No (`Disallow: /api/`) | n/a | Complete |
| `/sitemap.xml` | `/sitemap.xml` (assumed) | Metadata | Static | 200 | n/a | n/a | Lists the 5 public pages |
| `/robots.txt` | — | Metadata | Static | 200 | n/a | n/a | Disallow-all unless `SITE_ENV=production` |
| `/opengraph-image` | — | Social image (PNG 1200×630) | Static | 200 | n/a | n/a | Provisional design |
| `/icon.svg` | — | Favicon | Static | 200 | n/a | n/a | Provisional |
| `/feed/` | `/feed/` (WP default) | Redirect | Config | 308 → `/` | — | Inferred | Complete |
| `/zara-madid-speaking-about-her-influence-and-creative-vision/` | indexed article | — | — | **404** | — | Demonstration content | Intentionally not republished (410 proposed, OD-10) |
| Any other path | — | 404 page | Static | 404 | No | — | Complete |

Automated coverage: `tests/e2e/journeys.spec.ts`, `tests/e2e/links.spec.ts`, `tests/e2e/seo.spec.ts`.
