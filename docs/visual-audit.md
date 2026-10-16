# Visual audit

## Original vs rebuilt comparison: not possible

The commission asks for original-versus-rebuilt screenshots. **No capture of the original site could be obtained**: the domain does not resolve, archive services were unreachable, and no screenshots were supplied (`source-evidence.md`). So no page is described anywhere in this package as "pixel-perfect" or "faithful to the original layout".

| Area | Classification | Notes |
|---|---|---|
| Header | Unverifiable due to missing source | Sticky, wordmark left, nav right; mobile full-height menu |
| Navigation | Unverifiable | Four primary destinations matching the known routes |
| Hero / slider | Partially verifiable | Large slider on the three observed themes preserved; imagery missing (MC-03) |
| Typography | Unverifiable (provisional) | Serif display + system sans |
| Colours | Unverifiable (provisional) | Monochrome warm-paper / near-black |
| Image treatment | Unverifiable (no images) | No stock substitutes by design |
| Content hierarchy | Partially verifiable | Our Story section order and pathways preserved |
| CTA placement | Partially verifiable | Our Story pathways as observed |
| Footer | Unverifiable | |
| Mobile layout | Unverifiable | Composed for mobile; see screenshots |

Once original captures exist (from a WordPress export rendered locally, or from archive access), add them to `docs/evidence/original/` and compare at the same viewports.

## Regression baselines of the rebuild

`tests/e2e/visual.spec.ts` keeps full-page baselines in `tests/e2e/__screenshots__/` for five pages at 1440×900 (desktop) and 375×812 (mobile), plus the home page at 768px. Any unintended change beyond 1% of pixels fails the suite. To accept an intended change, run `npx playwright test visual --update-snapshots` and review the image diffs in the pull request.

Baselines are rendered in Linux Chromium with the system fonts available there. A different OS will produce different baselines, so regenerate them in CI rather than comparing across platforms.

## Responsive review

Checked automatically for horizontal overflow at 320, 375, 430, 640 (200% zoom equivalent), 768, 1024, 1440 and 1920px on every page (`navigation.spec.ts`, `accessibility.spec.ts`). Screenshots were reviewed by eye at 375 and 1440px for every page and at 768px for the homepage. Findings and fixes are in `qa-results.md`.
