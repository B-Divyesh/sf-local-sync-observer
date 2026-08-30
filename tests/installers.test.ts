import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("installer integrity", () => {
  it.runIf(process.platform !== "win32")("@claim:checksum-install refuses a bad checksum and installs only a verified asset", async () => {
    const fixture = await mkdtemp(join(tmpdir(), "lso-installer-"));
    const bin = join(fixture, "bin");
    const home = join(fixture, "home");
    await mkdir(bin);
    await mkdir(home);
    const asset = join(fixture, "observer.AppImage");
    await writeFile(asset, "candidate artifact\n");
    const hash = createHash("sha256").update(await readFile(asset)).digest("hex");
    const manifest = join(fixture, "latest.json");
    const writeManifest = (sha256: string) => writeFile(manifest, JSON.stringify({
      platforms: { "linux-x64": { name: "observer.AppImage", url: "https://example.invalid/observer.AppImage", sha256 } }
    }));
    await writeFile(join(bin, "uname"), "#!/bin/sh\n[ \"${1:-}\" = \"-m\" ] && printf 'x86_64\\n' || printf 'Linux\\n'\n");
    await writeFile(join(bin, "curl"), "#!/bin/sh\nout=''\nurl=''\nwhile [ $# -gt 0 ]; do\n  if [ \"$1\" = '-o' ]; then shift; out=$1; else url=$1; fi\n  shift\ndone\ncase \"$url\" in *latest.json) cp \"$MOCK_MANIFEST\" \"$out\" ;; *) cp \"$MOCK_ASSET\" \"$out\" ;; esac\n");
    await chmod(join(bin, "uname"), 0o755);
    await chmod(join(bin, "curl"), 0o755);
    const env = { ...process.env, HOME: home, PATH: `${bin}:${process.env.PATH}`, MOCK_MANIFEST: manifest, MOCK_ASSET: asset };

    await writeManifest("0".repeat(64));
    const rejected = spawnSync("sh", [join(root, "public/install.sh")], { env, encoding: "utf8" });
    expect(rejected.status).toBe(1);
    expect(rejected.stderr).toContain("Checksum mismatch; nothing was installed.");

    await writeManifest(hash);
    const accepted = spawnSync("sh", [join(root, "public/install.sh")], { env, encoding: "utf8" });
    expect(accepted.status).toBe(0);
    expect(accepted.stdout).toContain("Verified SHA-256 and installed");
    expect(await readFile(join(home, ".local/bin/local-sync-observer"), "utf8")).toBe("candidate artifact\n");
  });

  it("keeps PowerShell verification before installer launch", async () => {
    const script = await readFile(join(root, "public/install.ps1"), "utf8");
    expect(script.indexOf("Get-FileHash")).toBeGreaterThan(-1);
    expect(script.indexOf("Checksum mismatch")).toBeGreaterThan(script.indexOf("Get-FileHash"));
    expect(script.indexOf("Start-Process")).toBeGreaterThan(script.indexOf("Checksum mismatch"));
  });
});
