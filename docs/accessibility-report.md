# Accessibility report

**Target:** WCAG 2.2 AA.
**Result:** no known AA failures in the final build. Automated checks pass. An independent manual-equivalent review found 7 issues, all fixed and covered by regression tests. **A real screen-reader pass (NVDA, VoiceOver) has not been done and is still required.**

## Methods

| Method | Scope | Result |
|---|---|---|
| axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice) | All pages at 1440 and 375px; 404; contact form in error state; mobile menu open | 0 violations |
| Lighthouse accessibility | 5 pages × mobile/desktop | 100 everywhere |
| Structural tests | One `h1`, landmarks, no skipped heading levels | Pass, all pages |
| Target size (2.5.8) | All interactive elements ≥ 24×24 (inline text links exempt) | Pass |
| Reflow | No horizontal scroll at 320, 375, 430, 640 (200% zoom), 768, 1024, 1440, 1920 | Pass |
| Independent manual-equivalent review | Keyboard traversal of every page at three viewports; accessibility-tree dumps; mutation logging of live regions; computed contrast of every token; text-spacing override; focus-obscured checks | 7 findings, all fixed (below) |
| Keyboard journey (Journey F) | Complete the enquiry form with keyboard only | Pass (automated) |

## Contrast (computed from tokens)

| Pair | Ratio |
|---|---|
| Ink on paper | 16.6:1 |
| Muted text on paper / on white | 6.49:1 / 7.20:1 |
| Night-muted on night / on night-raised | 7.60:1 / 6.93:1 |
| Error text on error tint | 6.56:1 |
| Success text on success tint | 7.09:1 |
| Focus ring: blue on paper / light on dark | 7.5:1 / 16.6:1 |
| Accent `#b9a57e` | Decorative rules only, never text |

## Findings from the independent review

| ID | WCAG | Sev | Finding | Fix | Test |
|---|---|---|---|---|---|
| A11Y-01 | 3.3.1, 2.4.11 | P2 | Error-summary links left the label and error hidden under the sticky header | Summary links scroll the whole field into view (`scroll-margin-top`), then focus the input | `contact.spec.ts` (label top ≥ header bottom) |
| A11Y-02 | 4.1.3 | P2 | Summary was `role=alert` and re-rendered on every keystroke, so errors were re-announced continuously | Summary is a labelled group, focused on submit, and rebuilt only on submit; inline errors update live, without announcements | `contact.spec.ts`, axe |
| A11Y-03 | 2.4.3 | P2 | Focus dropped to `<body>` after activating the current-page link or widening the viewport with the menu open | Focus returns to the toggle, or moves to the matching desktop link | `navigation.spec.ts` (2 tests) |
| A11Y-04 | 1.3.1, 4.1.2 | P3 | Content behind the full-screen menu stayed reachable by the screen-reader cursor; toggle name flipped between Menu and Close | `main` and `footer` are `inert` while open; name stays "Menu", with state in `aria-expanded` | `navigation.spec.ts` |
| A11Y-05 | APG | P3 | Rotation resumed after keyboard blur; pause control came last; arrow keys did not move focus | Keyboard focus pauses until Play is pressed; rotation control first; arrows move focus | `slider.spec.ts` |
| A11Y-06 | 1.4.12 | P3 | Entity card overflowed 4px at 320px with text-spacing override | `min-width:0; overflow-wrap:anywhere` | Manual |
| A11Y-07 | 2.2.1 | P3 | Forms older than 6 h were rejected | Window raised to 24 h (WCAG 2.2.1 20-hour exception). Fast genuine submissions are held client-side rather than rejected (QA-02). | Unit + `contact.spec.ts` |
| S-2 | 4.1.2 | — | Radio group error relied on `aria-describedby` on the fieldset only | `aria-describedby` added to each radio. `aria-invalid` is not allowed on the radio role, so the fieldset/legend pattern is kept. | axe |

## Feature notes

- **Carousel:** APG carousel pattern. Inactive slides are `inert`. There is a pause/play control. No autoplay under `prefers-reduced-motion`. Hover and keyboard focus pause it. `aria-live` is off while rotating and polite when paused.
- **Forms:** visible labels; "All fields are required" stated up front; error summary with links; inline errors with a hidden "Error:" prefix; `aria-invalid` on text fields; character count linked by `aria-describedby`; focus moves to the success or failure notice.
- **Navigation:** skip link; `aria-current="page"`; consistent order on every page.
- **Motion:** every transition is disabled under `prefers-reduced-motion`.

## Outstanding

| Item | Why open | Owner |
|---|---|---|
| Real screen-reader testing (NVDA + Firefox/Chrome, VoiceOver iOS/macOS) | Not available in the build environment. Suspected item S-1: when a hidden slide becomes visible, screen readers may read the whole slide or nothing, because removing `inert` doesn't insert anything into the page; behaviour needs confirming. | Accessibility specialist before launch |
| Focus after client-side navigation stays on the clicked link | Standard Next.js behaviour; the route announcer reads the new title | Accept, or add focus-to-`h1` on route change |
| Brand palette swap | Re-run the contrast checks when real brand colours arrive | Brand + a11y |
