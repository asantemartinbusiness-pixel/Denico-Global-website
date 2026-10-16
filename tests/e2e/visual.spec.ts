import { expect, test } from "@playwright/test";

// Baselines of the rebuilt site. No original-site captures exist to compare
// against (see docs/visual-audit.md); these guard against regressions.
const PAGES = ["/", "/our-story/", "/inside-denico/", "/companies-2/", "/contact/"];

for (const path of PAGES) {
  test(`visual baseline ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const name = path === "/" ? "home" : path.replaceAll("/", "");
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

test("visual baseline: tablet 768 home", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await expect(page).toHaveScreenshot("home-768.png", { fullPage: true });
});
