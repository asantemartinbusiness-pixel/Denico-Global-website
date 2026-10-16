import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    // Requires `npm run build` first. Enquiries go to the local .outbox only.
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ENQUIRY_DELIVERY_MODE: "outbox",
      ENQUIRY_RATE_LIMIT: "1000",
      ENQUIRY_GLOBAL_RATE_LIMIT: "1000",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
