import { expect, test } from "@playwright/test";

async function navigate(page: import("@playwright/test").Page, isMobile: boolean, label: string) {
  if (isMobile) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: label, exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label, exact: true }).click();
  }
}

test("Journey A — general visitor: Home → Our Story → Inside Denico → Contact", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Denico Global/);

  await navigate(page, isMobile, "Our Story");
  await expect(page).toHaveURL(/\/our-story\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Our Story" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our Approach" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our Focus" })).toBeVisible();

  // Our Story preserves the pathways to Inside Denico, Portfolio and Business Enquiries.
  await page.getByRole("link", { name: /Inside Denico Global/ }).last().click();
  await expect(page).toHaveURL(/\/inside-denico\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Inside Denico Global" })).toBeVisible();

  await navigate(page, isMobile, "Contact");
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Get in touch");
});

test("Journey B — portfolio visitor: Home → Portfolio → Denico Studios → enquiry destination", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Group Portfolio Overview/ }).click();
  await expect(page).toHaveURL(/\/companies-2\/$/);

  const card = page.getByRole("article", { name: "Denico Studios" });
  await expect(card).toBeVisible();
  await expect(card.getByText("Operating company of Denico Global")).toBeVisible();
  await expect(card.getByRole("link", { name: "studio@denicoglobal.com" })).toHaveAttribute(
    "href",
    "mailto:studio@denicoglobal.com",
  );
  // Only confirmed entities are listed.
  await expect(page.getByRole("article")).toHaveCount(1);

  await card.getByRole("link", { name: /Enquire with Denico Studios/ }).click();
  await expect(page).toHaveURL(/\/contact\/\?enquiry=studios#enquiry-form$/);
  await expect(page.getByRole("radio", { name: "Denico Studios" })).toBeChecked();
});

test("Journey D — media enquiry: Contact → Press and media → correct destination", async ({ page }) => {
  await page.goto("/contact/");
  const press = page.getByRole("region", { name: "Press and media" });
  const link = press.getByRole("link", { name: "press@denicoglobal.com" });
  await expect(link).toHaveAttribute("href", "mailto:press@denicoglobal.com");
});

test("contact links: displayed text always matches the mailto destination (DEF-001)", async ({ page }) => {
  for (const path of ["/", "/contact/", "/companies-2/"]) {
    await page.goto(path);
    const mismatches = await page.$$eval('a[href^="mailto:"]', (links) =>
      links
        .filter((a) => a.textContent?.includes("@"))
        .filter((a) => a.getAttribute("href") !== `mailto:${a.textContent?.trim()}`)
        .map((a) => a.outerHTML),
    );
    expect(mismatches, path).toEqual([]);
  }
});

test("Journey G — editorial: the placeholder article is not republished", async ({ page }) => {
  const response = await page.goto("/zara-madid-speaking-about-her-influence-and-creative-vision/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page could not be found");
  await page.getByRole("link", { name: "Go to the homepage" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("unknown routes return a real 404 and legacy routes redirect", async ({ request }) => {
  expect((await request.get("/does-not-exist/")).status()).toBe(404);
  const noSlash = await request.get("/our-story", { maxRedirects: 0 });
  expect(noSlash.status()).toBe(308);
  expect(noSlash.headers()["location"]).toBe("/our-story/");
  const feed = await request.get("/feed/", { maxRedirects: 0 });
  expect(feed.status()).toBe(308);
});
