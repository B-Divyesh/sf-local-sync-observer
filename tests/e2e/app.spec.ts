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
  await page.getByRole("button", { name: "Try sample data" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await expect(page.getByText("Demo — sample data, nothing is saved to your real observer.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Open owning tool/ })).toBeVisible();
});

test("@claim:local-app-storage keeps unencrypted source settings in the local app namespace", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  await page.locator('input[name="apiKey"]').fill("test-only-key");
  await page.getByRole("button", { name: "Save and inspect" }).click();
  await expect(page.getByRole("heading", { name: "Native checks run in the installed desktop app." })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("local-sync-observer.v1"));
  expect(saved).toContain("test-only-key");
  expect(JSON.parse(saved ?? "{}").sources[0].apiKey).toBe("test-only-key");
  expect(requests.every(url => new URL(url).origin === appUrl)).toBe(true);
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Remove source" }).click();
  await expect(page.getByText("NO SOURCES / NO CLAIM")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("local-sync-observer.v1") ?? "null")?.sources)).toEqual([]);
});

test("@claim:open-owner opens the owning local tool without changing the sample", async ({ page }) => {
  await page.context().route("http://127.0.0.1:8384/", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Owning tool fixture</title>" }));
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Try sample data" }).click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Open owning tool/ }).click();
  const popup = await popupPromise;
  expect(popup.url()).toBe("http://127.0.0.1:8384/");
  await popup.close();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
});

test("@claim:thirty-second-refresh refreshes sources added after launch", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    let calls = 0;
    (window as Window & { __TAURI_INTERNALS__?: unknown; __probeCalls?: number }).__TAURI_INTERNALS__ = {
      invoke: async (command: string, args: Record<string, string>) => {
        if (command !== "probe_syncthing") throw new Error(`Unexpected command ${command}`);
        calls += 1;
        (window as Window & { __probeCalls?: number }).__probeCalls = calls;
        return { sourceId: args.sourceId, provider: "Syncthing", state: "converged", checkedAt: Date.now(), summary: "Every reported folder has zero pending items", folders: [], coverage: "fixture" };
      }
    };
  });
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  await page.locator('input[name="apiKey"]').fill("fixture-key");
  await page.getByRole("button", { name: "Save and inspect" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __probeCalls?: number }).__probeCalls ?? 0)).toBe(1);
  await page.clock.fastForward(30_000);
  await expect.poll(() => page.evaluate(() => (window as Window & { __probeCalls?: number }).__probeCalls ?? 0)).toBe(2);
});

test("inactive folder fields stay hidden when Syncthing is selected", async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  const dialog = page.getByRole("dialog", { name: "Add an evidence source" });
  await expect(dialog.locator('[data-fields="folder"]')).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Choose…" })).toBeHidden();
  await dialog.getByLabel("Folder metadata").check();
  await expect(dialog.locator('[data-fields="folder"]')).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Choose…" })).toBeVisible();
});

test("desktop shell has no serious accessibility violations or mobile overflow", async ({ page }) => {
  await page.goto(appUrl);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
