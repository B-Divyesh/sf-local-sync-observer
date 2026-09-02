import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const appUrl = "http://127.0.0.1:4174";
const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const appVersion = (JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string }).version;

test("desktop build identifies its exact source commit", async ({ page }) => {
  await page.goto(appUrl);
  await expect(page.getByLabel(`Version ${appVersion}, source commit ${sourceCommit}`)).toBeVisible();
});

test("desktop shell exposes an honest empty state and keyboard dialog", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(appUrl);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("NO SOURCES ADDED")).toBeVisible();
  await page.getByRole("button", { name: "Add first source" }).click();
  const dialog = page.getByRole("dialog", { name: "Add a source" });
  await expect(dialog).toBeVisible();
  await expect(page.locator('input[name="syncName"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("@claim:checks-require-source makes no provider check before Save and inspect", async ({ page }) => {
  await page.addInitScript(() => {
    const probeCommands = ["probe_syncthing", "probe_nextcloud_log", "inspect_folder"];
    (window as Window & { __providerProbes?: string[] }).__providerProbes = [];
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      invoke: async (command: string, args: Record<string, unknown>) => {
        if (probeCommands.includes(command)) {
          (window as Window & { __providerProbes?: string[] }).__providerProbes?.push(command);
          return {
            sourceId: args.sourceId,
            provider: "Syncthing",
            state: "converged",
            checkedAt: Date.now(),
            summary: "Every reported folder has zero pending items",
            folders: [],
            coverage: "fixture"
          };
        }
        if (command === "update_tray_status") return;
        throw new Error(`Unexpected command ${command}`);
      }
    };
  });

  await page.goto(appUrl);
  await expect(page.getByText("NO SOURCES ADDED")).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __providerProbes?: string[] }).__providerProbes)).toEqual([]);

  await page.getByRole("button", { name: "Add first source" }).click();
  await page.locator('input[name="apiKey"]').fill("fixture-key");
  expect(await page.evaluate(() => (window as Window & { __providerProbes?: string[] }).__providerProbes)).toEqual([]);

  await page.getByRole("button", { name: "Save and inspect" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __providerProbes?: string[] }).__providerProbes)).toEqual(["probe_syncthing"]);
});

test("@claim:local-endpoint-only accepts bracketed IPv6 loopback through the desktop setup form", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __TAURI_INTERNALS__?: unknown; __probeArguments?: Record<string, unknown>[] }).__probeArguments = [];
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      invoke: async (command: string, args: Record<string, unknown>) => {
        if (command === "update_tray_status") return;
        if (command === "probe_syncthing") {
          (window as Window & { __probeArguments?: Record<string, unknown>[] }).__probeArguments?.push(args);
          return {
            sourceId: args.sourceId,
            provider: "Syncthing",
            state: "converged",
            checkedAt: Date.now(),
            summary: "Every reported folder has zero pending items",
            folders: [],
            coverage: "fixture"
          };
        }
        throw new Error(`Unexpected command ${command}`);
      }
    };
  });

  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  await page.locator('input[name="endpoint"]').fill("http://[::1]:8384");
  await page.locator('input[name="apiKey"]').fill("fixture-key");
  await page.getByRole("button", { name: "Save and inspect" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __probeArguments?: Record<string, unknown>[] }).__probeArguments)).toEqual([
    expect.objectContaining({ endpoint: "http://[::1]:8384" })
  ]);
  await expect(page.getByRole("dialog", { name: "Add a source" })).toBeHidden();
});

test("example exposes the conflict in one action", async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Try sample data" }).click();
  await expect(page.getByText("1 conflict file needs attention")).toBeVisible();
  await expect(page.getByText("Example: shared research")).toBeVisible();
  await page.getByRole("button", { name: /Example: shared research/ }).click();
  await expect(page.getByText("Nextcloud reported sync activity still pending")).toBeVisible();
  await expect(page.getByText("Demo — sample data, nothing is saved to your real observer.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Open (sync tool|Nextcloud)/ })).toBeVisible();
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
  await expect(page.getByText("NO SOURCES ADDED")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("local-sync-observer.v1") ?? "null")?.sources)).toEqual([]);
});

test("@claim:open-owner opens the owning local tool without changing the sample", async ({ page }) => {
  await page.context().route("http://127.0.0.1:8384/", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Owning tool fixture</title>" }));
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Try sample data" }).click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Open sync tool/ }).click();
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

test("@claim:tray-status sends the current reading to the operating system tray", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __TAURI_INTERNALS__?: unknown; __trayUpdates?: unknown[] }).__trayUpdates = [];
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      invoke: async (command: string, args: Record<string, unknown>) => {
        if (command === "update_tray_status") {
          (window as Window & { __trayUpdates?: unknown[] }).__trayUpdates?.push(args);
          return;
        }
        if (command === "probe_syncthing") {
          return { sourceId: args.sourceId, provider: "Syncthing", state: "conflict", checkedAt: Date.now(), summary: "1 conflict file needs attention", folders: [], coverage: "fixture" };
        }
        throw new Error(`Unexpected command ${command}`);
      }
    };
  });
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  await page.locator('input[name="apiKey"]').fill("fixture-key");
  await page.getByRole("button", { name: "Save and inspect" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __trayUpdates?: Array<{ state?: string; attentionCount?: number }> }).__trayUpdates?.at(-1))).toEqual({ state: "conflict", attentionCount: 1 });
});

test("inactive folder fields stay hidden when Syncthing is selected", async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole("button", { name: "Add first source" }).click();
  const dialog = page.getByRole("dialog", { name: "Add a source" });
  await expect(dialog.locator('[data-fields="folder"]')).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Choose…" })).toBeHidden();
  await dialog.getByLabel("Folder names and metadata").check();
  await expect(dialog.locator('[data-fields="folder"]')).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Choose…" })).toBeVisible();
});

test("desktop shell has no serious accessibility violations or mobile overflow", async ({ page }) => {
  await page.goto(appUrl);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("desktop app reflows at 200% and keeps the home target and controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto(appUrl);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const failures = await page.locator('a[href], button, [tabindex]:not([tabindex="-1"])').evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) return [];
    const viewport = document.documentElement.clientWidth;
    if (rect.width + 0.1 < 44 || rect.height + 0.1 < 44) return [`too small: ${element.tagName}:${element.textContent?.trim()}=${rect.width}x${rect.height}`];
    if (rect.left < -0.1 || rect.right > viewport + 0.1) return [`clipped: ${element.tagName}:${element.textContent?.trim()}=${rect.left}-${rect.right}`];
    return [];
  }));
  expect(failures).toEqual([]);
  await expect(page.locator(".app-header .brand")).toHaveAccessibleName(/LS\/O/);
});
