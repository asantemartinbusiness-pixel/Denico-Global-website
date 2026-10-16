# Original site inventory

Page-by-page record of what is known about the original denicoglobal.com (a WordPress site) and how each page is handled in the rebuild. Evidence sources are explained in `source-evidence.md`.

**Confidence levels:** *Verified* = confirmed by observation of the live page. *Partially verified* = the page's existence and some elements were observed, but not its full content. *Unverified* = referenced, but nothing about the page was observed.

| Original URL | Title (observed) | Template | Confidence | What is known | Rebuild status |
|---|---|---|---|---|---|
| `/` | Home | Full-width slider + sections | Partially verified | Large visual slider on three themes: disciplined execution (disciplined capital / operational clarity), long-term thinking (long-term value), and building enduring brands. Full section list and imagery not recoverable. | Rebuilt. Slider themes preserved; wording and imagery reconstructed. |
| `/our-story/` | Our Story | Standard page | Partially verified | Sections "Our Approach" and "Our Focus". Describes Denico Global as "a long-term holding company combining disciplined capital allocation with active operational oversight". Pathways to Inside Denico Global, Group Portfolio Overview, Business Enquiries. | Rebuilt. Lede verbatim; section titles kept; bodies reconstructed. |
| `/inside-denico/` | Inside Denico Global | Standard page | Unverified (content) | Linked from Our Story. Content unknown. | Rebuilt with reconstructed content, consistent with the Entity Registry. Needs approval. |
| `/companies-2/` | Group Portfolio Overview | Standard page (auto-generated WP slug) | Unverified (content) | Linked from Our Story. Companies listed on it are unknown. | Rebuilt. Lists only Denico Studios (registry-confirmed). Slug preserved. |
| `/contact/` | Contact | Standard page + form | Verified (structure) | Intro; web enquiry form (Name and Email inputs observed, full schema not); group and business enquiries `info@denicoglobal.com`; administrative hours Mon–Fri 9:00 AM–5:00 PM, by appointment only; press/media `press@denicoglobal.com`; Denico Studio enquiries `studio@denicoglobal.com`. Defect DEF-001: the general enquiries address's displayed text did not match its link target. | Rebuilt with a working, tested form. DEF-001 corrected (pending OD-03). |
| `/zara-madid-speaking-about-her-influence-and-creative-vision/` | (article) | Single post | Unverified | Indexed article with an unrelated title, almost certainly theme demonstration content. No other trace of it exists. | **Not republished.** Returns 404. Recorded in `content-migration.md`. |
| `/feed/` | WordPress RSS | System | Inferred (WP default) | WordPress exposes this by default. | 308 redirect to `/`. |
| Privacy / legal pages | — | — | Unverified | None observed. | Draft privacy notice created at `/privacy/` (noindex), pending legal review (OD-08). |

## Elements not recoverable from any source

Logo, colour palette, typefaces, hero imagery, photography, icons, footer layout, header variations, dropdown structure, social links, analytics or cookie tooling, and the original form's full field list. See `missing-content-register.md`.
