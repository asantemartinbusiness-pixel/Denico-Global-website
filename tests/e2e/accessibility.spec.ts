import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES } from "./routes";

for (const { path } of [...PAGES, { path: "/missing-page/" }]) {
  test(`axe: no WCAG 2.2 A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect(summary).toEqual([]);
  });
}

test("axe: contact form in its error state", async ({ page }) => {
  await page.goto("/contact/");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("group", { name: "There is a problem with your enquiry" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test("axe: mobile menu open", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

for (const { path } of PAGES) {
  test(`structure: one h1, landmarks and ordered headings on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    const levels = await page.$$eval("main h1, main h2, main h3, main h4", (els) =>
      els.filter((el) => !el.closest("[inert]")).map((el) => Number(el.tagName[1])),
    );
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!, `heading jump on ${path}: ${levels.join(",")}`).toBeLessThanOrEqual(1);
    }
  });
}

test("interactive targets meet the 24×24px minimum (WCAG 2.5.8)", async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    const small = await page.$$eval("a, button, input, textarea, select", (els) =>
      els
        .filter((el) => {
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none" || el.closest("[inert], [aria-hidden=true]"))
            return false;
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return false;
          // Inline links inside running text are exempt.
          if (el.tagName === "A" && style.display === "inline") return false;
          return r.width < 24 || r.height < 24;
        })
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(small, path).toEqual([]);
  }
});

test("text remains usable at 200% zoom equivalent (640px CSS width)", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  for (const { path } of PAGES) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
