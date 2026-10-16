# Content migration

## Classification of original content

| Class | Items | Treatment |
|---|---|---|
| 1. Verified official content | Site description / Our Story lede; section titles "Our Approach", "Our Focus"; page titles; Our Story pathways; contact addresses; administrative hours; contact page structure | Migrated as observed |
| 2. Probable legacy content | `/companies-2/` slug (WordPress suffix for a duplicate slug); `/feed/` | Slug preserved; feed redirected |
| 3. Demonstration / template content | Article `/zara-madid-speaking-about-her-influence-and-creative-vision/` | **Not republished.** Recorded here for traceability. |
| 4. Content requiring approval | All `reconstructed` blocks (see `source-inventory.md`); privacy notice; Denico Studios wording; form field set | Implemented and labelled; awaiting approval |

## Template-content audit

| Check | Finding |
|---|---|
| Lorem ipsum / dummy statistics / placeholder images | None in the rebuild. Only one bracketed placeholder exists, in the **draft** privacy notice ("[To be confirmed: retention period…]"), and it is deliberate. |
| Unrelated demonstration articles | One (above). Excluded. |
| Example email addresses | None. The tests use the reserved `example.test` domain. |
| Incorrect contact links | DEF-001 (general enquiries text/link mismatch on the original). Fixed: displayed text equals the link target, enforced by test. |
| Template branding / authors | None carried over. |

### The "Zara Madid" article

- **Evidence:** an indexed URL with a title unrelated to a holding company, and no trace of the person or the article anywhere else on the web (search, 16 Oct 2026).
- **Assessment:** WordPress/theme demonstration post, made public by accident.
- **Action:** excluded; the URL returns 404. Proposal OD-10: return **410 Gone** at the host so search engines drop it faster.
- A human must confirm that it is not a genuine article before it is permanently discarded.

## Editorial standards applied

- British English (`lang="en-GB"`). The original's spelling convention was not observed; confirm in OD-11.
- Sentence-case headings, except the page titles observed on the original ("Our Story", "Group Portfolio Overview").
- No superlatives, return figures, investment invitations or regulatory claims.
- "Denico Studios" (registry canonical name) rather than the original's "Denico Studio" (OD-04).

## Approval workflow

Draft (this build) → Founder review in review mode (`NEXT_PUBLIC_REVIEW_MODE=1 npm run build && npm start`) → edit `src/content/*.ts` → change each approved block's `provenance` to `observed` (or add an `approved` note) → re-run `npm run check`.
