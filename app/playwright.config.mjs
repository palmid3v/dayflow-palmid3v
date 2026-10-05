import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["line"], ["json", { outputFile: "validation-reports/e2e-results.json" }]],
  use: {
    baseURL: process.env.DAYFLOW_VALIDATE_URL || "https://dayflow-palmid3v.vercel.app",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
});
