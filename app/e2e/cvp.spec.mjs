import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe.configure({ mode: "serial" });

const authFile = path.resolve("playwright/.auth/dayflow.json");
const email = process.env.DAYFLOW_VALIDATE_EMAIL || "";
const password = process.env.DAYFLOW_VALIDATE_PASSWORD || "";

async function waitForApp(page) {
  await expect(page.getByText("Your day, in one flow.")).toBeVisible({
    timeout: 30000
  });
}

async function ensureAuthenticated(browser, baseURL) {
  const hasStoredAuth = fs.existsSync(authFile);
  const context = await browser.newContext({
    storageState: hasStoredAuth ? authFile : undefined,
    viewport: { width: 1440, height: 1000 }
  });
  const page = await context.newPage();

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  const loginVisible = await page
    .getByLabel("Email")
    .isVisible()
    .catch(() => false);

  if (loginVisible) {
    if (!email || !password) {
      throw new Error(
        "CVP authentication requires DAYFLOW_VALIDATE_EMAIL and DAYFLOW_VALIDATE_PASSWORD."
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

  return { context, page };
}

test("DayFlow critical value path (CVP)", async ({ browser, baseURL }) => {
  const { context, page } = await ensureAuthenticated(browser, baseURL);

  try {
    await test.step("Authentication and Today shell", async () => {
      await expect(
        page.getByText(
          "Cloud sync is unavailable. Your local DayFlow data remains available."
        )
      ).toHaveCount(0);
    });

    await test.step("Today block critical flow", async () => {
      const title = "CVP Block " + Date.now();

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

    await test.step("Tasks critical flow", async () => {
      await page.getByRole("button", { name: "Tasks", exact: true }).last().click();

      const title = "CVP Task " + Date.now();

      await page.getByPlaceholder("Add a task…").fill(title);
      await page.getByRole("button", { name: "Add task" }).click();

      await expect(page.getByText(title, { exact: true })).toBeVisible();

      await page.getByRole("button", { name: title, exact: true }).click();

      const editor = page.locator("input:focus").first();
      await expect(editor).toBeVisible();
      await editor.fill(title + " edited");

      await page.getByRole("button", { name: "Save task" }).click();

      const taskRow = page
        .getByText(title + " edited", { exact: true })
        .locator("..");

      await taskRow.getByRole("button", { name: "Complete task" }).click();
      await expect(
        taskRow.getByRole("button", { name: "Reopen task" })
      ).toBeVisible();

      await taskRow.getByRole("button", { name: "Delete task" }).click();
      await expect(
        page.getByText(title + " edited", { exact: true })
      ).toHaveCount(0);
    });

    await test.step("Dashboard critical flow", async () => {
      await page.getByRole("button", { name: "Dashboard", exact: true }).last().click();

      await expect(page.getByText("Your operating week")).toBeVisible();
      await expect(page.getByText("COMPLETION RATE")).toBeVisible();
      await expect(page.getByText("PLAN ADHERENCE")).toBeVisible();
      await expect(page.getByText("CURRENT STREAK")).toBeVisible();
    });
  } finally {
    await context.close();
  }
});
