# Asset manifest

## Shipped assets

| ID | Asset | Path | Origin | Licence | Status |
|---|---|---|---|---|---|
| AM-01 | Typographic wordmark | `src/components/Wordmark.tsx` | Created for the rebuild (text in system fonts) | n/a | **Provisional.** Replace with the approved logo (SVG). |
| AM-02 | Favicon "D" | `src/app/icon.svg` | Created for the rebuild | n/a | Provisional |
| AM-03 | Open Graph image (1200×630) | `src/app/opengraph-image.tsx` (generated at build) | Created for the rebuild | n/a | Provisional |
| AM-04 | Hero hairline grid | CSS in `HeroSlider.module.css` | Created for the rebuild | n/a | Structural decoration; no imagery |

**No raster images, stock photography, AI-generated graphics, icon fonts or web fonts are shipped.** Typography uses system font stacks:

- Display: Iowan Old Style → Palatino → Book Antiqua → Georgia → serif
- Text: system-ui → -apple-system → Segoe UI → Roboto → Helvetica Neue → Arial

The result renders slightly differently on each platform, which is acceptable for a provisional identity. Once the brand typefaces are known, self-host them with `next/font/local` (licensed files only; never committed if the licence forbids it).

## Missing original assets

See `missing-content-register.md`, entries MC-01 to MC-03, MC-09 and MC-15.

## Adding recovered assets

1. Place approved files in `public/brand/` (logo SVG) or `public/images/` (photography, supplied as AVIF/WebP plus a JPEG fallback, at least 2400px wide for heroes).
2. Use `next/image` with explicit `width`/`height` or `fill` + `sizes`, and meaningful `alt` text (empty `alt` for decorative images).
3. Record each asset here with its origin and licence.
