import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [assetsDir = "release-assets", repo = "B-Divyesh/sf-local-sync-observer", version = "v0.1.2", sourceCommit = "unknown"] = process.argv.slice(2);

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
const platforms = Object.fromEntries(Object.entries(assets).map(([key, asset]) => [key, {
  name: asset.name,
  url: `${releaseBase}/${encodeURIComponent(asset.name)}`,
  sha256: asset.sha256
}]));
await writeFile(join(assetsDir, "latest.json"), `${JSON.stringify({ version, sourceCommit, publishedAt: new Date().toISOString(), platforms }, null, 2)}\n`);
await writeFile(join(assetsDir, "SHA256SUMS"), `${details.sort((a, b) => a.name.localeCompare(b.name)).map(item => `${item.sha256}  ${item.name}`).join("\n")}\n`);
