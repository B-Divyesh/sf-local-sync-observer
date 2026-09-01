import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [assetsDir, repo, version, sourceCommit] = process.argv.slice(2);

if (!assetsDir || !repo || !/^v\d+\.\d+\.\d+$/.test(version ?? "") || !/^[a-f0-9]{40}$/.test(sourceCommit ?? "")) {
  throw new Error("Usage: release-manifest.mjs <assets-dir> <owner/repo> <vX.Y.Z> <40-character-source-commit>");
}

async function filesUnder(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesUnder(path));
    else found.push(path);
  }
  return found;
}

const paths = (await filesUnder(assetsDir)).filter(path => !/(latest\.json|SHA256SUMS)$/.test(path));
const details = await Promise.all(paths.map(async path => ({
  path,
  name: basename(path),
  sha256: createHash("sha256").update(await readFile(path)).digest("hex")
})));
const find = (predicate, label) => {
  const item = details.find(({ name }) => predicate(name));
  if (!item) throw new Error(`Missing release asset for ${label}`);
  return item;
};
const assets = {
  "macos-arm64": find(name => /aarch64.*\.dmg$/i.test(name), "macOS arm64 DMG"),
  "macos-x64": find(name => /(x64|x86_64).*\.dmg$/i.test(name), "macOS x64 DMG"),
  "windows-x64": find(name => /x64.*\.msi$/i.test(name), "Windows MSI"),
  "linux-x64": find(name => /(amd64|x86_64).*\.AppImage$/i.test(name), "Linux AppImage")
};
const releaseBase = `https://github.com/${repo}/releases/download/${version}`;
const artifacts = details.sort((a, b) => a.name.localeCompare(b.name)).map(asset => ({
  name: asset.name,
  url: `${releaseBase}/${encodeURIComponent(asset.name)}`,
  sha256: asset.sha256,
  sourceCommit
}));
const platforms = Object.fromEntries(Object.entries(assets).map(([key, asset]) => [key, {
  name: asset.name,
  url: `${releaseBase}/${encodeURIComponent(asset.name)}`,
  sha256: asset.sha256,
  sourceCommit
}]));
await writeFile(join(assetsDir, "latest.json"), `${JSON.stringify({ version, sourceCommit, publishedAt: new Date().toISOString(), platforms, artifacts }, null, 2)}\n`);
await writeFile(join(assetsDir, "SHA256SUMS"), `${artifacts.map(item => `${item.sha256}  ${item.name}`).join("\n")}\n`);
