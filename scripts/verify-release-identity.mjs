import { readFile } from "node:fs/promises";

const [manifestPath, expectedVersion, expectedCommit] = process.argv.slice(2);
if (!manifestPath || !/^v\d+\.\d+\.\d+$/.test(expectedVersion ?? "") || !/^[a-f0-9]{40}$/.test(expectedCommit ?? "")) {
  throw new Error("Usage: verify-release-identity.mjs <latest.json> <vX.Y.Z> <40-character-source-commit>");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.version !== expectedVersion) throw new Error(`Release version mismatch: expected ${expectedVersion}, received ${manifest.version}`);
if (manifest.sourceCommit !== expectedCommit) throw new Error(`Release source mismatch: expected ${expectedCommit}, received ${manifest.sourceCommit}`);

const artifacts = Array.isArray(manifest.artifacts) ? manifest.artifacts : [];
if (artifacts.length < 6) throw new Error(`Expected at least six downloadable artifacts, received ${artifacts.length}`);
const required = [/aarch64.*\.dmg$/i, /(x64|x86_64).*\.dmg$/i, /x64.*\.msi$/i, /x64.*-setup\.exe$/i, /(amd64|x86_64).*\.AppImage$/i, /(amd64|x86_64).*\.deb$/i];
for (const pattern of required) {
  if (!artifacts.some((artifact) => pattern.test(artifact.name))) throw new Error(`Missing required release artifact matching ${pattern}`);
}
for (const artifact of artifacts) {
  if (artifact.sourceCommit !== expectedCommit) throw new Error(`${artifact.name} identifies ${artifact.sourceCommit}, not ${expectedCommit}`);
  if (!artifact.url.startsWith(`https://github.com/`) || !artifact.url.includes(`/releases/download/${expectedVersion}/`)) throw new Error(`${artifact.name} URL does not identify ${expectedVersion}`);
  if (!/^[a-f0-9]{64}$/.test(artifact.sha256)) throw new Error(`${artifact.name} has no valid SHA-256`);
}

const platforms = manifest.platforms && typeof manifest.platforms === "object" ? Object.values(manifest.platforms) : [];
if (platforms.length !== 4 || platforms.some((artifact) => artifact.sourceCommit !== expectedCommit)) {
  throw new Error("Every platform download must identify the expected source commit");
}

console.log(`Verified ${expectedVersion}: ${artifacts.length} artifacts identify source commit ${expectedCommit}.`);
