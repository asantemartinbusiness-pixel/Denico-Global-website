import { expect, test } from "@playwright/test";
import { ALLOWED_MAILTO, PAGES } from "./routes";

test("every link and button has a legitimate destination", async ({ page, request }) => {
  test.skip(test.info().project.name !== "desktop", "crawl once");
  const internal = new Set<string>();

  for (const { path } of [...PAGES, { path: "/missing-page/" }]) {
    await page.goto(path);
    const hrefs = await page.$$eval("a", (links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      expect(href, `empty or placeholder href on ${path}`).not.toMatch(/^(#?|javascript:.*)$/);
      if (href.startsWith("mailto:")) {
        expect(ALLOWED_MAILTO, `unexpected mail destination on ${path}`).toContain(href.slice(7));
      } else if (href.startsWith("/")) {
        internal.add(href.split("#")[0]!);
      } else if (!href.startsWith("#")) {
        throw new Error(`Unexpected external link on ${path}: ${href}`);
      }
    }
    const unnamed = await page.$$eval("a, button", (els) =>
      els.filter((el) => !el.closest("[aria-hidden=true]") && !(el.getAttribute("aria-label") || el.textContent?.trim())).length,
    );
    expect(unnamed, `unnamed controls on ${path}`).toBe(0);
  }

  for (const href of internal) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
  // Same-page anchors must resolve to an element.
  await page.goto("/companies-2/");
  await expect(page.locator("#denico-studios")).toHaveCount(1);
  await page.goto("/contact/");
  await expect(page.locator("#enquiry-form")).toHaveCount(1);
});
