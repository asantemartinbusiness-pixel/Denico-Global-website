# Open decisions (human approval required)

Nothing in this list has been decided on Denico's behalf. Each item names the default currently implemented, so that the build stays reversible.

| ID | Decision | Owner | Current default in the build | Blocks launch? |
|---|---|---|---|---|
| OD-01 | **Public copy approval.** Every block labelled `reconstructed` (slider wording, Our Story bodies, Inside Denico, portfolio note, contact intro) needs approval or replacement. Private doctrine wording was deliberately not used; the founder may choose to release approved language. | Founder | Reconstructed copy, labelled | **Yes** |
| OD-02 | **Supply original source material**: WordPress export or DB dump, `wp-content/uploads`, brand files, or allow this environment to reach `web.archive.org`. | Founder / hosting holder | Not available | No (but limits fidelity) |
| OD-03 | **Contact routing.** Confirm info@, press@ and studio@ are live, monitored and correct. Confirm that DEF-001 (info@ text pointing elsewhere on the old site) should be resolved to info@. | Founder / operations | Text = link = info@; delivery disabled in production | **Yes** |
| OD-04 | **Name: "Denico Studios" vs "Denico Studio".** The old site used "Studio"; the canonical company name in Denico's records is "Studios". | Founder / brand | "Denico Studios" | Yes |
| OD-05 | **Administrative hours.** Add a time zone/location; confirm the hours are still valid and how appointments are requested. | Operations | Hours as observed, no time zone | Yes |
| OD-06 | **Form fields.** Name and Email were observed; the build adds Type of enquiry and Message. Confirm, or supply the original schema. | Founder | Four fields | No |
| OD-07 | **Group vs company responsibilities** (Inside Denico table). Confirm the split. | Founder | Draft table | Yes (content) |
| OD-08 | **Privacy notice.** Legal entity name, address, governing law, retention period, and approval. | Legal | Draft, noindex, linked from the footer | **Yes** |
| OD-09 | **Rename `/companies-2/` → `/portfolio/`** with a 308 redirect. | Founder / SEO | Legacy slug kept | No |
| OD-10 | **Return 410 for the "Zara Madid" demo article**, after confirming it is not genuine. | Founder | 404 | No |
| OD-11 | **Spelling convention** (British vs American English). | Founder | British (`en-GB`) | No |
| OD-12 | **Hosting platform and form delivery provider.** | Founder / tech | None chosen; no deployment | **Yes** (for go-live) |
| OD-13 | **Canonical domain** (apex vs `www`) and DNS plan. The domain currently does not resolve. | Founder / hosting | `https://denicoglobal.com` | **Yes** |
| OD-14 | **Brand identity**: approve the provisional wordmark and palette, or supply the original logo, palette and fonts. | Founder / brand | Provisional | Yes (fidelity) |
| OD-15 | **Portfolio scope.** Add any other confirmed companies; each needs a confirmed relationship and permission to be named. | Founder | Denico Studios only | No |
| OD-16 | **Slider autoplay.** Keep a 7-second rotation (pausable; off under reduced motion), or use static slides. | Brand | Autoplay with pause | No |

Hosting suspension or DNS failure is an **infrastructure** issue, separate from this rebuild. Whoever holds the hosting and registrar accounts should investigate why denicoglobal.com stopped resolving, because the email addresses in OD-03 may be affected too.
