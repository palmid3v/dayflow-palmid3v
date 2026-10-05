import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe.configure({ mode: "serial" });

const authFile = path.resolve("playwright/.auth/dayflow.json");
const icsFile = path.resolve("e2e/fixtures/validation.ics");
const email = process.env.DAYFLOW_VALIDATE_EMAIL || "";
const password = process.env.DAYFLOW_VALIDATE_PASSWORD || "";

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

async function waitForApp(page) {
  try {
    await expect(page.getByText("Your day, in one flow.")).toBeVisible({ timeout: 30000 });
  } catch (error) {
    const bodyText = await page.locator("body").innerText().catch(function () {
      return "";
    });
    const compactBody = bodyText.replace(/\s+/g, " ").trim().slice(0, 2000);

    throw new Error(
      "DayFlow did not reach the authenticated app shell. " +
        "Current URL: " +
        page.url() +
        ". " +
        "Visible state: " +
        compactBody,
      { cause: error }
    );
  }
}

async function ensureAuthenticated(browser, baseURL) {
  const hasStoredAuth = fs.existsSync(authFile);

  const context = await browser.newContext({
    storageState: hasStoredAuth ? authFile : undefined,
    permissions: ["notifications"],
    viewport: { width: 1440, height: 1000 }
  });

  const page = await context.newPage();

  page.on("console", function (message) {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", function (error) {
    pageErrors.push(error.message);
  });

  page.on("requestfailed", function (request) {
    failedRequests.push(
      request.method() +
        " " +
        request.url() +
        " :: " +
        (request.failure()?.errorText || "request failed")
    );
  });

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  const loginVisible = await page
    .getByLabel("Email")
    .isVisible()
    .catch(function () {
      return false;
    });

  if (loginVisible) {
    if (!email || !password) {
      throw new Error(
        "Authentication is required for E2E validation. Set DAYFLOW_VALIDATE_EMAIL and DAYFLOW_VALIDATE_PASSWORD once."
      );
    }

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();

    await waitForApp(page);

    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({
      path: authFile,
      indexedDB: true
    });
  } else {
    await waitForApp(page);
  }

  return {
    context,
    page
  };
}

async function goTab(page, name) {
  await page.getByRole("button", { name, exact: true }).last().click();
}

test("DayFlow production end-to-end validation", async function ({ browser, baseURL }) {
  const state = await ensureAuthenticated(browser, baseURL);
  const context = state.context;
  const page = state.page;

  try {
    await test.step("Authentication and Today", async function () {
      await waitForApp(page);

      await expect(
        page.getByText("Cloud sync is unavailable. Your local DayFlow data remains available.")
      ).toHaveCount(0);
    });

    await test.step("Today block CRUD", async function () {
      const title = "QA Today " + Date.now();

      await page.getByLabel("Add a block to today").fill(title);
      await page.getByRole("button", { name: "Add block" }).click();

      await expect(page.getByText(title, { exact: true })).toBeVisible();

      await page
        .getByRole("button", {
          name: new RegExp(title + ", currently planned")
        })
        .click();

      await expect(
        page.getByRole("button", {
          name: new RegExp(title + ", currently completed")
        })
      ).toBeVisible();

      await page.getByRole("button", { name: "Delete " + title }).click();

      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    });

    await test.step("Tasks CRUD", async function () {
      await goTab(page, "Tasks");

      const title = "QA Task " + Date.now();

      await page.getByPlaceholder("Add a task…").fill(title);
      await page.getByRole("button", { name: "Add task" }).click();

      await expect(page.getByText(title, { exact: true })).toBeVisible();

      // Enter task edit mode before locating the editor.
      await page.getByRole("button", { name: title, exact: true }).click();

      const editor = page.locator("input:focus").first();

      await expect(editor).toBeVisible();
      await editor.fill(title + " edited");

      await page.getByRole("button", { name: "Save task" }).click();

      await expect(
        page.getByText(title + " edited", { exact: true })
      ).toBeVisible();

      await page.getByRole("button", { name: "Complete task" }).click();

      await expect(
        page.getByRole("button", { name: "Reopen task" })
      ).toBeVisible();

      await page.getByRole("button", { name: "Delete task" }).click();

      await expect(
        page.getByText(title + " edited", { exact: true })
      ).toHaveCount(0);
    });

    await test.step("Schedule CRUD", async function () {
      await goTab(page, "Schedule");

      const title = "QA Schedule " + Date.now();

      await page.getByPlaceholder("Schedule block").fill(title);
      await page.getByRole("button", { name: "Add" }).click();

      await expect(page.getByText(title, { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Delete schedule" }).last().click();

      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    });

    await test.step("Calendar ICS import and clear", async function () {
      const input = page.locator(
        'input[type="file"][accept=".ics,text/calendar"]'
      );

      await expect(input).toHaveCount(1);
      await input.setInputFiles(icsFile);

      await expect(
        page.getByText(/1 events imported from validation\.ics/)
      ).toBeVisible({ timeout: 30000 });

      await expect(
        page.getByText("validation.ics", { exact: true })
      ).toBeVisible();

      await page.getByRole("button", { name: /Clear import/ }).click();

      await expect(
        page.getByText("Imported calendar cleared.")
      ).toBeVisible({ timeout: 30000 });
    });

    await test.step("Reminders CRUD and notification", async function () {
      await goTab(page, "Today");

      const title = "QA Reminder " + Date.now();

      await page.getByLabel("Reminder title").fill(title);
      await page.getByLabel("Add reminder").click();

      await expect(page.getByText(title, { exact: true })).toBeVisible();

      await page
        .getByRole("button", {
          name: "Complete reminder: " + title
        })
        .click();

      await expect(
        page.getByRole("button", {
          name: "Reopen reminder: " + title
        })
      ).toBeVisible();

      await page
        .getByRole("button", {
          name: "Delete reminder: " + title
        })
        .click();

      await expect(page.getByText(title, { exact: true })).toHaveCount(0);

      const enable = page.getByRole("button", { name: "Enable" });

      if (await enable.count()) {
        await enable.click();
      }

      const testNotification = page.getByRole("button", { name: "Test" });

      if (await testNotification.count()) {
        await testNotification.click();
      }
    });

    await test.step("Daily memory", async function () {
      const note = "QA Memory " + Date.now();

      await goTab(page, "Today");

      await page
        .getByPlaceholder("Add a note about today…")
        .fill(note);

      await page
        .getByRole("button", { name: "Save daily review" })
        .click();

      await expect(
        page.getByRole("button", { name: "Review saved" })
      ).toBeVisible();

      await goTab(page, "Memory");

      await expect(
        page.getByText(note, { exact: true })
      ).toBeVisible({ timeout: 30000 });

      // Remove the QA note before the run finishes so repeated validation
      // does not accumulate test content in the user's daily memory.
      await goTab(page, "Today");

      await page
        .getByPlaceholder("Add a note about today…")
        .fill("");

      await page
        .getByRole("button", { name: "Review saved" })
        .click();
    });

    await test.step("Dashboard", async function () {
      await goTab(page, "Dashboard");

      await expect(page.getByText("Your operating week")).toBeVisible();
      await expect(page.getByText("COMPLETION RATE")).toBeVisible();
      await expect(page.getByText("PLAN ADHERENCE")).toBeVisible();
      await expect(page.getByText("CURRENT STREAK")).toBeVisible();
    });

    await test.step("Admin access manager", async function () {
      const adminButton = page.getByRole("button", {
        name: "Open admin access manager"
      });

      if (await adminButton.count()) {
        await adminButton.click();

        await expect(
          page.getByRole("dialog", { name: "Access Manager" })
        ).toBeVisible();

        await expect(page.getByText("ACCESS HEALTH")).toBeVisible();
        await expect(page.getByText("FEATURE ADOPTION")).toBeVisible();

        await page
          .getByRole("button", { name: "Close access manager" })
          .click();
      }
    });

    await test.step("Settings and session controls", async function () {
      await page
        .getByRole("button", { name: "Open settings" })
        .click();

      await expect(
        page.getByRole("dialog", { name: "Settings" })
      ).toBeVisible();

      await page.getByRole("button", { name: "Done" }).click();

      await expect(
        page.getByRole("button", { name: "Sign out" })
      ).toBeVisible();
    });

    const unexpected = []
      .concat(
        consoleErrors.map(function (message) {
          return "console.error: " + message;
        })
      )
      .concat(
        pageErrors.map(function (message) {
          return "pageerror: " + message;
        })
      )
      .concat(
        failedRequests.map(function (message) {
          return "requestfailed: " + message;
        })
      );

    if (unexpected.length) {
      throw new Error(
        "Browser/runtime errors detected:\n" + unexpected.join("\n")
      );
    }
  } finally {
    await context.close();
  }
});
