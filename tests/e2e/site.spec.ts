import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing page has one clear heading and a usable download path", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("https://github.com/B-Divyesh/sf-local-sync-observer/releases/latest/download/latest.json", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ version: "v0.1.0", platforms: { "linux-x64": { name: "observer.AppImage", url: "https://example.test/observer.AppImage", sha256: "abc" } } })
  }));
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Sync Observer/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("actually synced");
  await expect(page.locator("img")).toHaveAttribute("alt", /conflict lane/);
  await expect(page.getByRole("link", { name: /Download for/ }).first()).toHaveAttribute("href", /AppImage|releases/);
  expect(errors).toEqual([]);
});

test("landing page has no serious accessibility violations", async ({ page }) => {
  await page.route("https://github.com/**", route => route.abort());
  await page.goto("/");
  // @axe-core/playwright carries a newer structural Page type, while the
  // repository intentionally pins the factory browser version.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const serious = results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical");
  expect(serious).toEqual([]);
});

test("legal pages remain readable at mobile width", async ({ page }) => {
  await page.goto("/privacy/");
  await expect(page.locator("h1")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/terms/");
  await expect(page.locator("main")).toBeVisible();
});
