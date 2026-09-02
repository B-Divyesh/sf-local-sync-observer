import AxeBuilder from "@axe-core/playwright";
import { devices, expect, test } from "@playwright/test";

test("@claim:release-downloads landing page has one clear heading and a usable download path", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Android users receive the separately covered desktop-only handoff.");
  const published = {
    linux: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/observer.AppImage",
    windows: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/observer.msi",
    macArm: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/observer-aarch64.dmg",
    macX64: "https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/observer-x64.dmg"
  };
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("https://api.github.com/repos/B-Divyesh/sf-local-sync-observer/releases/latest", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ tag_name: "v0.1.3", assets: [
      { name: "Local.Sync.Observer_0.1.3_amd64.AppImage", browser_download_url: published.linux },
      { name: "Local.Sync.Observer_0.1.3_x64_en-US.msi", browser_download_url: published.windows },
      { name: "Local.Sync.Observer_0.1.3_aarch64.dmg", browser_download_url: published.macArm },
      { name: "Local.Sync.Observer_0.1.3_x64.dmg", browser_download_url: published.macX64 }
    ] })
  }));
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Sync Observer/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("synced after offline work");
  await expect(page.locator(".hero-art img")).toHaveAttribute("alt", /conflict lane/);
  const primary = page.getByRole("link", { name: /Download for.*GitHub/ }).first();
  const label = await primary.textContent();
  const expectedUrl = label?.includes("Windows") ? published.windows : label?.includes("Apple silicon") ? published.macArm : label?.includes("Intel") ? published.macX64 : published.linux;
  await expect(primary).toHaveAttribute("href", expectedUrl);
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/?demo=1");
  await expect(page.getByText("Opens a sample conflict board; nothing is saved.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("@claim:mobile-desktop-handoff gives Android and iOS a truthful desktop-only download handoff", async ({ browser }) => {
  const phones = [
    { name: "Pixel 5", options: devices["Pixel 5"] },
    { name: "iPhone 13", options: devices["iPhone 13"] }
  ];
  for (const phone of phones) {
    const context = await browser.newContext({ ...phone.options, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const githubRequests: string[] = [];
    page.on("request", request => {
      if (new URL(request.url()).origin === "https://api.github.com") githubRequests.push(request.url());
    });
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.getByText("This app runs on macOS, Windows, and Linux. Open this site on a computer to download it.")).toBeVisible();
    await expect(page.locator("#download-note")).toBeHidden();
    await expect(page.locator("#primary-download")).toBeHidden();
    const firstScreen = await page.locator(".trust-list li").evaluateAll(items => ({
      factBottoms: items.map(item => item.getBoundingClientRect().bottom),
      viewportBottom: window.innerHeight
    }));
    expect(firstScreen.factBottoms, `${phone.name} must show every first-screen fact`).toHaveLength(3);
    expect(firstScreen.factBottoms.every(bottom => bottom <= firstScreen.viewportBottom)).toBe(true);
    expect(githubRequests).toEqual([]);
    await context.close();
  }
});

test("@claim:site-private uses no cookies, analytics, or undisclosed network origin", async ({ page }, testInfo) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.route("https://api.github.com/**", route => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await expect(page.getByText("This app runs on macOS, Windows, and Linux. Open this site on a computer to download it.")).toBeVisible();
  } else {
    await expect(page.getByText("Downloads are being published.")).toBeVisible();
  }
  expect(await page.context().cookies()).toEqual([]);
  expect(requests.every(url => ["http://127.0.0.1:4173", "https://api.github.com"].includes(new URL(url).origin))).toBe(true);
});

test("@claim:no-product-account opens the working demo without sign-in", async ({ page }) => {
  await page.goto("/demo/?demo=1");
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await expect(page.locator('input[type="email"], input[type="password"], a[href*="login"], a[href*="signup"]')).toHaveCount(0);
  expect(await page.context().cookies()).toEqual([]);
  await page.goto("http://127.0.0.1:4174/?demo=1");
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await expect(page.locator('input[type="email"], a[href*="login"], a[href*="signup"]')).toHaveCount(0);
});

test("@claim:release-fallback shows the release page when GitHub is unavailable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Android users receive the separately covered desktop-only handoff.");
  await page.route("https://api.github.com/**", route => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/");
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open releases on GitHub/ })).toHaveAttribute("href", "https://github.com/B-Divyesh/sf-local-sync-observer/releases");
});

test("@claim:release-cache-retention removes an expired release cache when GitHub is unavailable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Android users do not request release metadata.");
  await page.addInitScript(() => localStorage.setItem("local-sync-observer.release.v1", JSON.stringify({
    cachedAt: Date.now() - 2 * 60 * 60 * 1000,
    release: { tag_name: "v0.0.0", assets: [] }
  })));
  await page.route("https://api.github.com/**", route => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/");
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.release.v1"))).toBeNull();
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

test("unknown-page artifact is styled, focuses its recovery heading, and logs no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Page not found — Local Sync Observer");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.getByRole("link", { name: "Go to home" })).toHaveCSS("background-color", "rgb(23, 23, 23)");
  expect(errors).toEqual([]);
});

test("public routes use complete metadata, shared navigation, and route-heading focus", async ({ page }) => {
  for (const route of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator("header nav")).toContainText("DemoHow it worksPrivacyDownload");
    await expect(page.locator("footer nav")).toContainText("PrivacyTermsSource on GitHub");
    await expect(page.locator("h1")).toBeFocused();
  }
});

test("Back and Forward restore each route's scroll position and heading focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The reviewed history path uses the desktop header link.");
  await page.route("https://api.github.com/**", route => route.abort());
  await page.goto("/");
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" as ScrollBehavior }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1000);

  // Activate the header link without Playwright first scrolling it into view;
  // the saved position must be the user's position, not automation's.
  await page.locator("header").getByRole("link", { name: "Privacy" }).evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1000);

  await page.goForward();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
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

test("@claim:mixed-provider-demo shows the named Syncthing and Nextcloud sample evidence", async ({ page }) => {
  await page.goto("/demo/?demo=1");
  await expect(page.getByText("Syncthing conflict plus Nextcloud pending activity")).toBeVisible();
  await expect(page.locator(".demo-note")).toContainText("The Syncthing sample has a conflict-copy filename.");
  await expect(page.locator(".demo-note")).toContainText("The Nextcloud sample has a desktop-log message that work is still pending.");
  const syncthingRow = page.getByRole("row").filter({ hasText: "Syncthing: Field notes" });
  await expect(syncthingRow).toContainText("Conflict");
  const nextcloudRow = page.getByRole("row").filter({ hasText: "Nextcloud: Shared research" });
  await expect(nextcloudRow).toContainText("Pending");
  await expect(nextcloudRow).toContainText("Not reported");
});

test("@claim:isolated-demo loads, resets, and keeps sample data out of the real namespace", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("local-sync-observer.v1", "real-sentinel"));
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByText("Demo — sample data, nothing is saved to your real observer.")).toBeVisible();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
  expect(await page.evaluate(() => localStorage.getItem("demo:local-sync-observer.site.v1"))).not.toBeNull();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
  await page.getByRole("link", { name: "Choose a download" }).click();
  await expect(page).toHaveURL(/\/#download$/);
  expect(await page.evaluate(() => localStorage.getItem("demo:local-sync-observer.site.v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"))).toBe("real-sentinel");
});

test("@claim:demo-private sends no third-party requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/demo/?demo=1");
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  expect(requests.every(url => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:offline-demo-reload works offline after the first demo visit", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/demo/?demo=1");
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await context.close();
});
