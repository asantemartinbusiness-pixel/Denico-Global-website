import { expect, test } from "@playwright/test";
import { PAGES } from "./routes";

for (const { path, title } of PAGES) {
  test(`metadata on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length ?? 0).toBeGreaterThan(50);
    expect(description?.length ?? 0).toBeLessThanOrEqual(170);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    // Non-production builds must not be indexable.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
}

test("titles and descriptions are unique", async ({ page }) => {
  const seen = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    const key = `${await page.title()}|${await page.locator('meta[name="description"]').getAttribute("content")}`;
    expect(seen.has(key)).toBe(false);
    seen.add(key);
  }
});

test("robots.txt blocks indexing outside production and sitemap lists public routes", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \//);
  const headers = (await request.get("/")).headers();
  expect(headers["x-robots-tag"]).toContain("noindex");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/", "/our-story/", "/inside-denico/", "/companies-2/", "/contact/"]) {
    expect(sitemap).toContain(`denicoglobal.com${path}<`);
  }
  expect(sitemap).not.toContain("/privacy/");
});

test("homepage exposes Organization structured data", async ({ page }) => {
  await page.goto("/");
  const json = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(json["@type"]).toBe("Organization");
  expect(json.name).toBe("Denico Global");
});

test("Open Graph image renders", async ({ request }) => {
  const res = await request.get("/opengraph-image");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});

test("security headers are present", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});
