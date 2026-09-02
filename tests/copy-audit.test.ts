import { readFile, writeFile } from "node:fs/promises";
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

  it("lists each mobile handoff sentence once without merging them", async () => {
    const audit = await readFile(resolve(root, ".factory/copy-audit.md"), "utf8");
    const landing = audit.slice(0, audit.indexOf("## README sentences"));
    const platformSentence = "This app runs on macOS, Windows, and Linux.";
    const downloadSentence = "Open this site on a computer to download it.";
    expect(landing.split(platformSentence)).toHaveLength(2);
    expect(landing.split(downloadSentence)).toHaveLength(2);
    expect(landing).not.toContain(`${platformSentence} ${downloadSentence}`);
  });

  it("accepts the generated audit after a CRLF checkout conversion", async () => {
    const target = resolve(root, ".factory/copy-audit.md");
    const original = await readFile(target, "utf8");
    await writeFile(target, original.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"));
    try {
      const result = spawnSync(process.execPath, ["scripts/copy-audit.mjs", "--check"], { cwd: root, encoding: "utf8" });
      expect(result.status, result.stderr).toBe(0);
    } finally {
      await writeFile(target, original);
    }
  });
});
