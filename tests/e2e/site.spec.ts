import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("@claim:release-downloads landing page has one clear heading and a usable download path", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("https://api.github.com/repos/B-Divyesh/sf-local-sync-observer/releases/latest", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ tag_name: "v0.1.1", assets: [{ name: "Local_Sync_Observer_0.1.1_amd64.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.1/observer.AppImage" }] })
  }));
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Sync Observer/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("synced after offline work");
  await expect(page.locator("img")).toHaveAttribute("alt", /conflict lane/);
  await expect(page.getByRole("link", { name: /Download for/ }).first()).toHaveAttribute("href", /AppImage|releases/);
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/");
  expect(errors).toEqual([]);
});

test("landing page has no serious accessibility violations", async ({ page }) => {
  await page.route("https://api.github.com/**", route => route.abort());
  await page.goto("/");
  // @axe-core/playwright carries a newer structural Page type, while the
  // repository intentionally pins the factory browser version.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const serious = results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical");
  expect(serious).toEqual([]);
});

test("legal pages remain readable and named at mobile width", async ({ page }) => {
  await page.goto("/privacy/");
  await expect(page.locator("h1")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page: page as never }).analyze()).violations.filter(item => item.impact === "serious" || item.impact === "critical")).toEqual([]);
  await expect(page.locator("header .brand")).toHaveAccessibleName(/LS\/O/);
  await page.goto("/terms/");
  await expect(page.locator("main")).toBeVisible();
  expect((await new AxeBuilder({ page: page as never }).analyze()).violations.filter(item => item.impact === "serious" || item.impact === "critical")).toEqual([]);
});

test("@claim:isolated-demo loads, resets, and keeps sample data out of the real namespace", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page.getByText("Demo — sample data, nothing is saved to your real observer.")).toBeVisible();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("demo:local-sync-observer.site.v1"))).not.toBeNull();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBeNull();
});

test("@claim:demo-private sends no third-party requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/demo/");
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(requests.every(url => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:offline-demo-reload works offline after the first demo visit", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/demo/");
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await context.close();
});
