import { expect, test } from "@playwright/test";

test.describe("homepage slider", () => {
  test("controls change slides and inactive slides are inert", async ({ page }) => {
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    const slides = carousel.locator('[aria-roledescription="slide"]');
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(0)).not.toHaveAttribute("inert", /.*/);
    await expect(slides.nth(1)).toHaveAttribute("inert", "");

    await carousel.getByRole("button", { name: "Next slide" }).click();
    await expect(slides.nth(1)).toHaveAttribute("data-active", "true");
    await expect(carousel.getByRole("heading", { name: "Built for the long term." })).toBeVisible();

    await carousel.getByRole("button", { name: "Previous slide" }).click();
    await carousel.getByRole("button", { name: "Previous slide" }).click();
    await expect(slides.nth(2)).toHaveAttribute("data-active", "true");

    await carousel.getByRole("button", { name: /Slide 1:/ }).click();
    await expect(slides.nth(0)).toHaveAttribute("data-active", "true");
    await expect(carousel.getByRole("button", { name: /Slide 1:/ })).toHaveAttribute("aria-current", "true");
  });

  test("arrow keys move between slides from the slide picker, and focus follows", async ({ page }) => {
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await carousel.getByRole("button", { name: /Slide 1:/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^2 of 3/);
    await expect(carousel.getByRole("button", { name: /Slide 2:/ })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^3 of 3/);
  });

  test("each slide CTA leads to a real page", async ({ page }) => {
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await carousel.getByRole("link", { name: "Read our story" }).click();
    await expect(page).toHaveURL(/\/our-story\/$/);
  });

  test("does not autoplay when reduced motion is requested", async ({ page }) => {
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await expect(carousel.getByRole("button", { name: "Play slideshow" })).toBeEnabled();
    await page.waitForTimeout(7600);
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^1 of 3/);
  });

  test("autoplays without reduced motion and can be paused", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(test.info().project.use.baseURL + "/");
    await page.mouse.move(0, 0);
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await expect(carousel.getByRole("button", { name: "Pause slideshow" })).toBeVisible();
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^2 of 3/, {
      timeout: 9000,
    });
    await carousel.getByRole("button", { name: "Pause slideshow" }).click();
    await page.mouse.move(0, 0);
    await expect(carousel.getByRole("button", { name: "Play slideshow" })).toBeVisible();
    await page.waitForTimeout(7600);
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^2 of 3/);
    await context.close();
  });

  test("keyboard focus stops rotation until Play is pressed (APG)", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(test.info().project.use.baseURL + "/");
    const carousel = page.getByRole("region", { name: "Denico Global introduction" });
    await expect(carousel.getByRole("button", { name: "Pause slideshow" })).toBeVisible();
    // Tab from the skip link and header into the carousel; the rotation control comes first.
    await carousel.getByRole("button", { name: "Pause slideshow" }).focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(carousel.getByRole("button", { name: "Play slideshow" })).toBeVisible();
    await page.keyboard.press("Shift+Tab"); // leave the carousel
    await page.waitForTimeout(7600);
    await expect(carousel.locator('[data-active="true"]')).toHaveAttribute("aria-label", /^1 of 3/);
    await context.close();
  });
});
