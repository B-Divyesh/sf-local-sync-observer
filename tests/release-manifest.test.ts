import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("release manifest", () => {
  it("@claim:release-matrix requires every platform and records candidate identity plus checksums", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lso-release-"));
    await mkdir(join(directory, "nested"));
    const names = [
      "Local.Sync.Observer_0.1.3_aarch64.dmg",
      "Local.Sync.Observer_0.1.3_x64.dmg",
      "Local.Sync.Observer_0.1.3_x64_en-US.msi",
      "Local.Sync.Observer_0.1.3_x64-setup.exe",
      "Local.Sync.Observer_0.1.3_amd64.AppImage",
      "Local.Sync.Observer_0.1.3_amd64.deb"
    ];
    await Promise.all(names.map((name, index) => writeFile(join(index % 2 ? join(directory, "nested") : directory, name), `artifact-${index}`)));
    const commit = "1234567890abcdef1234567890abcdef12345678";
    const result = spawnSync(process.execPath, [join(root, "scripts/release-manifest.mjs"), directory, "owner/repo", "v0.1.3", commit], { encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const manifest = JSON.parse(await readFile(join(directory, "latest.json"), "utf8")) as { version: string; sourceCommit: string; platforms: Record<string, { url: string; sha256: string }> };
    expect(manifest.version).toBe("v0.1.3");
    expect(manifest.sourceCommit).toBe(commit);
    expect(Object.keys(manifest.platforms).sort()).toEqual(["linux-x64", "macos-arm64", "macos-x64", "windows-x64"]);
    expect(Object.values(manifest.platforms).every(item => item.url.startsWith("https://github.com/owner/repo/releases/download/v0.1.3/") && /^[a-f0-9]{64}$/.test(item.sha256))).toBe(true);
    const sums = await readFile(join(directory, "SHA256SUMS"), "utf8");
    expect(names.every(name => sums.includes(`  ${name}`))).toBe(true);

    const verify = spawnSync(process.execPath, [join(root, "scripts/verify-release-identity.mjs"), join(directory, "latest.json"), "v0.1.3", commit], { encoding: "utf8" });
    expect(verify.status, verify.stderr).toBe(0);
  });

  it("rejects the reproduced stale-release commit mismatch", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lso-stale-release-"));
    const candidate = "a83cfb8a6bcf126bdd66b2ef443106f52c061786";
    const stale = "3782d78e04858fdc566f33665452f1a45025f4e8";
    await writeFile(join(directory, "latest.json"), JSON.stringify({ version: "v0.1.7", sourceCommit: stale, platforms: {}, artifacts: [] }));
    const result = spawnSync(process.execPath, [join(root, "scripts/verify-release-identity.mjs"), join(directory, "latest.json"), "v0.1.7", candidate], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`expected ${candidate}, received ${stale}`);
  });
});
