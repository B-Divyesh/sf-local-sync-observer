import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const appUrl = "http://127.0.0.1:4174";

test("desktop shell exposes an honest empty state and keyboard dialog", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(appUrl);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("NO SOURCES / NO CLAIM")).toBeVisible();
  await page.getByRole("button", { name: "Add first source" }).click();
  const dialog = page.getByRole("dialog", { name: "Add an evidence source" });
  await expect(dialog).toBeVisible();
  await expect(page.locator('input[name="syncName"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("example exposes the conflict in one action", async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Preview an example" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await expect(page.getByRole("button", { name: /Open owning tool/ })).toBeVisible();
});

test("desktop shell has no serious accessibility violations or mobile overflow", async ({ page }) => {
  await page.goto(appUrl);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
