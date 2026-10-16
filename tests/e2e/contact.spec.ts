import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const uniqueMessage = (label: string) =>
  `Playwright ${label} test enquiry ${Date.now()}-${Math.random().toString(36).slice(2)}.`;

async function fill(page: Page, message: string, type = "Group and business enquiry") {
  await page.getByLabel("Name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("visitor@example.test");
  await page.getByRole("radio", { name: type }).check();
  await page.getByLabel("Message").fill(message);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/contact/");
  // The server rejects submissions completed faster than a human could.
  await page.waitForTimeout(2600);
});

test("shows an error summary and inline errors, focused for assistive technology", async ({ page }) => {
  await page.getByRole("button", { name: "Send enquiry" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "There is a problem" });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(4);
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Name")).toHaveAccessibleDescription(/Enter your name/);

  await summary.getByRole("link", { name: "Enter your email address." }).click();
  await expect(page.getByLabel("Email address")).toBeFocused();

  await page.getByLabel("Email address").fill("bad-address");
  await expect(page.getByText("Enter an email address in the format name@example.com.").first()).toBeVisible();
});

test("Journey C — business enquiry: complete form → test-mode delivery → truthful confirmation", async ({ page }) => {
  const message = uniqueMessage("journey-c");
  await fill(page, message);
  const responsePromise = page.waitForResponse("**/api/enquiry/");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  const status = page.getByRole("status").filter({ hasText: "test mode" });
  await expect(status.getByRole("heading", { name: "Enquiry recorded in test mode" })).toBeVisible();
  await expect(status).toContainText("has not been delivered to Denico Global");
  const reference = (await status.locator("strong").last().textContent())!.trim();
  expect(reference).toMatch(/^DG-\d{8}-[0-9A-F]{8}$/);

  const saved = JSON.parse(await readFile(path.join(process.cwd(), ".outbox", `${reference}.json`), "utf8"));
  expect(saved.enquiry.message).toBe(message);
  expect(saved.to).toBe("(recipient not configured)");

  await page.getByRole("button", { name: "Send another enquiry" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("");
});

test("double-clicking submit sends a single request", async ({ page }) => {
  await fill(page, uniqueMessage("double"));
  let requests = 0;
  await page.route("**/api/enquiry/", async (route) => {
    requests++;
    await new Promise((r) => setTimeout(r, 400));
    await route.continue();
  });
  await page.getByRole("button", { name: "Send enquiry" }).dblclick();
  await expect(page.getByRole("heading", { name: "Enquiry recorded in test mode" })).toBeVisible();
  expect(requests).toBe(1);
});

test("network failure shows an honest error with the email fallback", async ({ page }) => {
  await fill(page, uniqueMessage("network"), "Press and media");
  await page.route("**/api/enquiry/", (route) => route.abort("internetdisconnected"));
  await page.getByRole("button", { name: "Send enquiry" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "has not been sent" });
  await expect(alert).toBeFocused();
  await expect(alert).toContainText("could not reach the server");
  await expect(alert.getByRole("link", { name: "press@denicoglobal.com" })).toHaveAttribute(
    "href",
    "mailto:press@denicoglobal.com",
  );
  // Values are preserved so the visitor can retry.
  await expect(page.getByLabel("Name")).toHaveValue("Test Visitor");
});

test("unconfigured delivery (503) is reported, never shown as success", async ({ page }) => {
  await fill(page, uniqueMessage("unavailable"));
  await page.route("**/api/enquiry/", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: "unavailable",
        message: "Online enquiries are not available at the moment. Please email us directly.",
      }),
    }),
  );
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "has not been sent" })).toContainText(
    "not available at the moment",
  );
  await expect(page.getByText("Enquiry recorded")).toHaveCount(0);
});

test("server-side validation rejects tampered input", async ({ request }) => {
  const res = await request.post("/api/enquiry/", {
    headers: { "content-type": "application/json", origin: "http://evil.example" },
    data: { name: "x" },
  });
  expect(res.status()).toBe(403);

  const bad = await request.post("/api/enquiry/", {
    data: {
      name: "",
      email: "x",
      enquiryType: "general",
      message: "short",
      website: "",
      startedAt: Date.now() - 5000,
      idempotencyKey: "abcdefabcdefabcdef",
    },
  });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).fieldErrors).toMatchObject({ name: expect.any(String), email: expect.any(String) });

  const huge = await request.post("/api/enquiry/", {
    headers: { "content-type": "application/json" },
    data: "x".repeat(20_000),
  });
  expect(huge.status()).toBe(413);

  expect((await request.get("/api/enquiry/")).status()).toBe(405);
});

test("Journey F — keyboard-only completion of the enquiry form", async ({ page }) => {
  const name = page.getByLabel("Name");
  await name.focus();
  await page.keyboard.type("Keyboard User");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Email address")).toBeFocused();
  await page.keyboard.type("keyboard@example.test");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "Group and business enquiry" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Press and media" })).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Message")).toBeFocused();
  await page.keyboard.type(uniqueMessage("keyboard"));
  await page.keyboard.press("Tab"); // privacy link
  await expect(page.getByRole("link", { name: "privacy notice", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Send enquiry" })).toBeFocused();
  await page.keyboard.press("Enter");
  // Focus moves to the confirmation so screen readers announce the outcome.
  await expect(page.getByRole("status").filter({ hasText: "Enquiry recorded in test mode" })).toBeFocused();
});
