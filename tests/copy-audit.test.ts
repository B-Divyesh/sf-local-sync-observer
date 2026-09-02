import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("copy audit", () => {
  it("extracts rendered headings, annotations, and the literal demo URL", async () => {
    const result = spawnSync(process.execPath, ["scripts/copy-audit.mjs", "--check"], { cwd: root, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const audit = await readFile(resolve(root, ".factory/copy-audit.md"), "utf8");
    expect(audit).toContain("Check what synced after offline work.");
    expect(audit).toContain("A folder check can find common conflict copies.");
    expect(audit).toContain("Only Syncthing’s pending count can establish “Converged.”");
    expect(audit).toContain("https://local-sync-observer.sociobot.in/?demo=1");
  });
});
