import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("@claim:release-downloads landing page has one clear heading and a usable download path", async ({ page }) => {
  const published = {
    linux: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.2/observer.AppImage",
    windows: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.2/observer.msi",
    macArm: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.2/observer-aarch64.dmg",
    macX64: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.2/observer-x64.dmg"
  };
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("https://api.github.com/repos/B-Divyesh/sf-local-sync-observer/releases/latest", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ tag_name: "v0.1.2", assets: [
      { name: "Local.Sync.Observer_0.1.2_amd64.AppImage", browser_download_url: published.linux },
      { name: "Local.Sync.Observer_0.1.2_x64_en-US.msi", browser_download_url: published.windows },
      { name: "Local.Sync.Observer_0.1.2_aarch64.dmg", browser_download_url: published.macArm },
      { name: "Local.Sync.Observer_0.1.2_x64.dmg", browser_download_url: published.macX64 }
    ] })
  }));
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Sync Observer/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("synced after offline work");
  await expect(page.locator(".hero-art img")).toHaveAttribute("alt", /conflict lane/);
  const primary = page.getByRole("link", { name: /Download for/ }).first();
  const label = await primary.textContent();
  const expectedUrl = label?.includes("Windows") ? published.windows : label?.includes("Apple silicon") ? published.macArm : label?.includes("Intel") ? published.macX64 : published.linux;
  await expect(primary).toHaveAttribute("href", expectedUrl);
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/");
  expect(errors).toEqual([]);
});

test("@claim:site-private uses no cookies, analytics, or undisclosed network origin", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.route("https://api.github.com/**", route => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/");
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  expect(await page.context().cookies()).toEqual([]);
  expect(requests.every(url => ["http://127.0.0.1:4173", "https://api.github.com"].includes(new URL(url).origin))).toBe(true);
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

test("unknown-page artifact is styled and logs no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Page not found — Local Sync Observer");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page is not on this board.");
  await expect(page.getByRole("link", { name: "Go to home" })).toHaveCSS("background-color", "rgb(23, 23, 23)");
  expect(errors).toEqual([]);
});

test("landing page reflows at 200% and keeps visible controls at least 44px", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.route("https://api.github.com/**", route => route.abort());
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const undersized = await page.locator('a[href], button, [tabindex]:not([tabindex="-1"])').evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) return [];
    return rect.width + 0.1 < 44 || rect.height + 0.1 < 44 ? [`${element.tagName}:${element.textContent?.trim()}=${rect.width}x${rect.height}`] : [];
  }));
  expect(undersized).toEqual([]);
});

test("landing page includes three captioned product walkthrough frames", async ({ page }) => {
  await page.route("https://api.github.com/**", route => route.abort());
  await page.goto("/");
  const frames = page.locator(".walkthrough-list figure");
  await expect(frames).toHaveCount(3);
  for (const image of await frames.locator("img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test("@claim:isolated-demo loads, resets, and keeps sample data out of the real namespace", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("local-sync-observer.v1", "real-sentinel"));
  await page.goto("/demo/");
  await expect(page.getByText("Demo — sample data, nothing is saved to your real observer.")).toBeVisible();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
  expect(await page.evaluate(() => localStorage.getItem("demo:local-sync-observer.site.v1"))).not.toBeNull();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/#download$/);
  expect(await page.evaluate(() => localStorage.getItem("demo:local-sync-observer.site.v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
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
