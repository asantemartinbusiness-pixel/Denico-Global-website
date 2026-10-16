# QA results

## Final automated results

| Suite | Command | Result | Evidence |
|---|---|---|---|
| Typecheck | `npm run typecheck` | Pass | — |
| Lint | `npm run lint` | Pass (0 errors, 0 warnings) | — |
| Unit (Vitest) | `npm test` | **31 passed** | `evidence/unit-results.txt` |
| E2E (Playwright, desktop 1440 + mobile 375) | `npx playwright test` | **0 failed**, see evidence for counts; skips are per-project by design (e.g. mobile-only tests skipped on desktop) | `evidence/e2e-results.txt` |
| Production build | `npm run build` | Pass: 8 static routes, 1 dynamic API | — |
| Production deps audit | `npm audit --omit=dev` | 0 vulnerabilities | — |

## Journey matrix

| Journey | Coverage | Result |
|---|---|---|
| A: General visitor (Home → Our Story → Inside Denico → Contact) | `journeys.spec.ts`, both viewports | Pass |
| B: Portfolio visitor (Home → Portfolio → Denico Studios → enquiry destination) | `journeys.spec.ts` | Pass; preselects the Studios type |
| C: Business enquiry (form → test delivery → confirmation) | `contact.spec.ts`; outbox file verified | Pass; confirmation says "test mode, not delivered" |
| D: Media enquiry (Contact → Press → destination) | `journeys.spec.ts` | Pass (`mailto:press@`) |
| E: Mobile (Home → menu → Portfolio → Contact → submit) | `navigation.spec.ts` + QA manual | Pass |
| F: Accessibility (keyboard-only completion) | `contact.spec.ts` | Pass |
| G: Editorial (listing → article → return) | `journeys.spec.ts` | **Not applicable**: no verified editorial content exists. The only known article is demonstration content and returns 404 with a working route home. |

## Failure-mode coverage

Validation errors and summary · server field errors · network offline · 500/502/503/429/413 · double, triple and concurrent submission · id reuse (409) · cross-origin (403) · wrong content type (415) · oversized body (413) · GET (405) · fast submission held, not rejected · JS disabled · invalid `?enquiry=` values · 404s and trailing-slash redirects · horizontal overflow at 320–1920 (+2560 by QA) · 200% zoom · text-spacing override.

## Independent reviews

Four reviewers worked independently from the build team, against the running production build. None of them modified code.

| Review | Findings | Outcome |
|---|---|---|
| Security & privacy | 6 verified (2 × P2, 4 × P3) + 4 theoretical | Fixed or accepted (`security-review.md`); fixes re-probed live (`evidence/security-reprobe.txt`) |
| Accessibility (WCAG 2.2 AA) | 7 verified + 3 suspected | All verified items fixed (`accessibility-report.md`); real screen-reader test outstanding |
| Content accuracy, brand & UX | 0 × P1, 6 × P2, 9 × P3; no invented facts; no internal-wording leakage | Fixed or logged to open decisions |
| QA break-it | 1 × P1, 1 × P2, 2 × P3 + 5 minor | All fixed except one cosmetic item at 2560px |

The full list is in `defect-register.md`.

## Post-fix verification

- **Security fixes** re-probed against the rebuilt server: 8 of 8 behave as intended (`evidence/security-reprobe.txt`).
- **QA-01 (no JS):** submit disabled, notice above the form, Enter does not submit, URL unchanged; the mobile nav shows inline links.
- **QA-04 (fold):** hero CTA and all controls are within the viewport at 1366×657, 1280×720, 1440×600 and 375×667.
- **A11Y-06:** 0px overflow at 320px with the WCAG 1.4.12 text-spacing override.
- **Lighthouse** re-run after all fixes (`performance-report.md`).

## Not tested

- Real screen readers (NVDA, JAWS, VoiceOver).
- Browsers other than Chromium: Safari/WebKit and Firefox are not installed in the build environment. Test both before launch, especially iOS Safari for the mobile menu `inert` behaviour and `100svh` units.
- Real email delivery: no provider is configured, by mandate.
- Production hosting behaviour (CDN, platform IP header, multi-instance).
