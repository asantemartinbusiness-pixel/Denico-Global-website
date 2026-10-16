import { expect, test } from "@playwright/test";

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("primary nav marks the current page", async ({ page }) => {
    await page.goto("/inside-denico/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Inside Denico" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Contact" })).not.toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  });

  test("logo returns home", async ({ page }) => {
    await page.goto("/contact/");
    await page.getByRole("link", { name: "Denico Global — home" }).first().click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("menu opens, traps focus, closes with Escape and restores focus", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();

    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("link", { name: "Home" })).toBeFocused();

    // Tab cycles within the toggle and menu links.
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    const focusedInHeader = await page.evaluate(() => Boolean(document.activeElement?.closest("header")));
    expect(focusedInHeader).toBe(true);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("Journey E — mobile: Home → menu → Portfolio → Contact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Portfolio" }).click();
    await expect(page).toHaveURL(/\/companies-2\/$/);
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
    await page.getByRole("link", { name: /Enquire with Denico Studios/ }).click();
    await expect(page.getByRole("radio", { name: "Denico Studios" })).toBeChecked();
  });
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/our-story/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  test(`no horizontal overflow at ${width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport set explicitly");
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/our-story/", "/inside-denico/", "/companies-2/", "/contact/", "/privacy/"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}
