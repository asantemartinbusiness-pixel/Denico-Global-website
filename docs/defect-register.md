# Defect register

Severity: **P0** critical security/data integrity or core function blocked · **P1** major failure in an essential journey · **P2** material usability, accessibility, presentation or SEO defect · **P3** minor.

Found by: **Build** = build team's own testing · **SEC / CON / QA / A11Y** = independent reviewers.

## Summary

| Severity | Found | Fixed | Accepted / open |
|---|---|---|---|
| P0 | 0 | 0 | 0 |
| P1 | 1 | 1 | 0 |
| P2 | 16 | 15 | 1 (SEC-04, deployment-dependent) |
| P3 | 23 | 17 | 6 (accepted, documented) |

## Register

| ID | Sev | Source | Defect | Resolution | Status |
|---|---|---|---|---|---|
| DEF-001 | P2 | Original site | General enquiries link text ≠ mailto target | Text = target for every mailto; enforced by test | Fixed (routing pending OD-03) |
| QA-01 | **P1** | QA | With JS off, the form submitted by GET: personal data in the URL, then silently lost | `method="post"`; submit disabled until hydrated (blocks implicit submit); no-JS notice above the form | Fixed, verified |
| QA-02 | P2 | QA | Fast genuine submissions (autofill/paste) rejected with "reload" advice that wipes input | Client waits out the minimum time; server message no longer says reload | Fixed + test |
| QA-03 | P3 | QA | "Send another enquiry" cleared the chosen type | Type kept | Fixed + test |
| QA-04 | P3 | QA | Slider controls below the fold at 1366×657 / 1280×720 / 1440×600 | Hero sizes scale with viewport height | Fixed, verified at 4 sizes |
| QA-05 | P3 | QA | No-JS mobile: menu button inert, no nav | `<noscript>` style shows links inline, hides toggle | Fixed, verified |
| QA-06 | P3 | QA | Fields editable while sending; edits silently dropped | Fields read-only and radios disabled while sending | Fixed |
| QA-07 | P3 | QA | Dedupe ignored the name | Name included in content hash | Fixed |
| QA-08 | P3 | QA | At 2560px, hero hairlines don't align with the content column | Cosmetic | Accepted |
| SEC-A | P2 | SEC | Rate limit keyed on spoofable X-Forwarded-For | Trusted platform header only; otherwise global bucket | Fixed + test + re-probe |
| SEC-B | P2 | SEC | Unbounded limiter memory | Hard cap + LRU eviction | Fixed + test |
| SEC-C | P3 | SEC | Dedupe leaked another submitter's reference / suppressed their enquiry | Client-scoped; disabled in global bucket; 409 on id reuse | Fixed + tests + re-probe |
| SEC-D | P3 | SEC | Concurrent duplicates all delivered | In-flight coalescing; stable webhook idempotency key | Fixed + test + re-probe |
| SEC-E | P3 | SEC | Origin check trusted X-Forwarded-Host; loose content-type match | Host/configured origin only; Sec-Fetch-Site; exact media type | Fixed + test + re-probe |
| SEC-F | P3 | SEC | Honeypot optional; client-supplied timestamp | Honeypot required; timestamp kept as a noise filter | Partly fixed, accepted |
| SEC-03 | P3 | SEC | CSP `unsafe-inline` | Static-generation trade-off | Accepted |
| SEC-04 | P2 | SEC | Process-local rate limit and dedupe | Needs shared store or WAF when deployed | **Open (deployment)** |
| CON-F1 | P2 | CON | Copy implied several group companies | Rewritten to "each business Denico Global owns"; singular heading; counter removed | Fixed |
| CON-F2 | P2 | CON | Some provenance labels overstated the source | Relabelled reconstructed; Studios description reduced to registry facts | Fixed |
| CON-L1 | P2 | CON | Code notes exposed internal registry field names | Neutral wording | Fixed |
| CON-B1 | P2 | CON | Homepage didn't say what Denico Global is above the fold | Visible `h1` "Denico Global — a long-term holding company" in the hero | Fixed |
| CON-B2 | P2 | CON | Display font depended on the visitor's OS | Self-hosted OFL serif (provisional) | Fixed |
| CON-F3 | P3 | CON | "Studio" → "Studios" rename labelled observed | Note clarifies rename | Fixed (OD-04) |
| CON-F4 | P3 | CON | "Brand stewardship" conflicted with company brand independence | Replaced by "Active oversight" | Fixed |
| CON-L2 | P3 | CON | Three sentences close to internal wording | Reworded / flagged for approval | Fixed / OD-01 |
| CON-U1 | P3 | CON | Short nav labels vs full page titles | Conventional; kept | Accepted |
| CON-U2 | P3 | CON | Studios content duplicated on Inside and Portfolio | Inside shortened to a summary + link | Fixed |
| CON-U3 | P3 | CON | "By appointment only" with no booking route | Observed copy; OD-05 | Accepted (pending OD-05) |
| CON-U4 | P3 | CON | Footer links to a draft privacy notice | Must be resolved before launch | Accepted (OD-08) |
| A11Y-01 | P2 | A11Y | Summary links hid label/error under the sticky header | Field scrolled into view | Fixed + test |
| A11Y-02 | P2 | A11Y | Alert re-announced on every keystroke | Summary rebuilt on submit only, not an alert | Fixed |
| A11Y-03 | P2 | A11Y | Focus lost to body from the mobile menu | Focus restored | Fixed + tests |
| A11Y-04 | P3 | A11Y | Background reachable behind the menu; toggle name flip | `inert`; stable name | Fixed + test |
| A11Y-05 | P3 | A11Y | Carousel APG deviations | Focus pauses; control order; arrow focus | Fixed + tests |
| A11Y-06 | P3 | A11Y | 4px overflow at 320 with text spacing | min-width / wrap | Fixed, verified (0px) |
| A11Y-07 | P2 | A11Y | 6-hour form time limit | 24 h | Fixed + test |
| BLD-01 | P2 | Build | Logo accessible name didn't contain its visible text (2.5.3) | Visible text + hidden " — home" | Fixed (Lighthouse) |
| BLD-02 | P3 | Build | zod eval probe raised a CSP issue | zod jitless | Fixed (Lighthouse) |
| BLD-03 | P2 | Build | Subpages lost the OG image | Explicit OG image per page | Fixed + test |
| BLD-04 | P3 | Build | Nested `<aside>` landmark; duplicate header element | Markup corrected | Fixed (axe) |

No P0 or P1 defects remain open.
