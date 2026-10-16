# Source evidence log

Recovery attempts for the original denicoglobal.com, run on 16 October 2026 from the build environment. Every attempt is recorded, including the ones that failed.

## Summary

The original website could **not** be retrieved. The domain no longer resolves in DNS, archive services were unreachable from this environment, and search engines return no indexed pages for the domain. The reconstruction therefore rests on three source classes, ranked by authority:

| Rank | Source class | What it supports | Label used in code |
|---|---|---|---|
| 1 | **Denico Entity Registry** (founder-held, private) | Which entities exist, their relationship to Denico Global, and whether each may be named publicly | `registry` |
| 2 | **Commissioning brief observations** of the live site, recorded before it went offline | Page titles, section titles, positioning statements, contact addresses, hours, routes, the slider themes, DEF-001 | `observed` |
| 3 | **Reconstruction**: new wording written from rank-2 positioning | Body copy where the original wording is unknown | `reconstructed` (approval required) |

The private Denico knowledge base also holds approved corporate doctrine. It is classified internal, and this repository is public, so its wording has **not** been reproduced here. It was used only to (a) confirm which entities may be named, and (b) avoid contradicting group positioning. See OD-01.

## Recovery attempts

| # | Source | Method | Result | Evidence |
|---|---|---|---|---|
| 1 | `https://denicoglobal.com/` and `/our-story/`, `/contact/`, `/sitemap.xml`, `/wp-sitemap.xml`, `www.` | `curl` through the environment proxy | Blocked: proxy refused the tunnel (403, environment network policy) | Recorded in session |
| 2 | Same URLs | Fetch tool (separate egress path) | **DNS failure: `getaddrinfo ENOTFOUND denicoglobal.com`**. The domain does not currently resolve. | Recorded in session |
| 3 | Wayback Machine CDX index (`web.archive.org/cdx/...`) | `curl` and fetch tool | Blocked by network policy (403) / the fetch tool refused the host | Recorded in session |
| 4 | archive.ph | Fetch tool | Fetch tool refused the host | Recorded in session |
| 5 | Web search: `denicoglobal.com`, `"Denico Global" holding company`, `"Denico Global" "long-term holding company"`, `"Denico Studio"` / `"Inside Denico"` / `"disciplined capital"` | Search tool | No pages from the domain are indexed. Results refer to **unrelated** companies (Denico Food Ingredients / Denico ApS, Denmark; Denico Inc., Rhode Island; DINICO Global). None of these is connected to Denico Global, and none is used. | Recorded in session |
| 6 | Indexed article `/zara-madid-speaking-about-her-influence-and-creative-vision/` | Exact-title web search | No match anywhere. Consistent with theme demonstration content. | Recorded in session |
| 7 | GitHub `asantemartinbusiness-pixel/Denicoglobal` (public) | `git clone` | Repository contains only a one-line README (`# Denicoglobal`). No source, theme, export or assets. | Commit `f00aadf` |
| 8 | Founder-held private knowledge base | Read-only review | Entity Registry and approved doctrine located. It confirms Denico Global (holding company) and Denico Studios (owned operating company, `public_reference: true`). It explicitly records that **Denico Global's own visual identity (logo, typography, palette) is "not yet recorded"**. | Not reproduced (internal) |
| 9 | WordPress export / database backup / brand files | n/a | **Not supplied** | Requested in OD-02 |

## Hazards identified during recovery

- **Name collision.** "Denico" is used by several unrelated businesses, the most prominent being a Danish food-ingredients company that was in the news in October 2026. Nothing about those companies may appear on this site. Search results about them are not evidence.
- **Archive dating.** No archived snapshot could be reviewed, so no content can be dated. If snapshots are recovered later, check them against the brief's observations before use.

## How to close the gap

Any one of these would let the reconstruction move from "reconstructed" to "verified":

1. A WordPress export (`.xml`) or database dump of the original site.
2. Access to the `wp-content/uploads` media library (logo, hero images).
3. Network access for this environment to `web.archive.org` (environment setting → Network access → allowed domains), so archived snapshots can be reviewed.
4. Founder-approved copy for each page (see `content-migration.md`).
