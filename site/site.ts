type PlatformKey = "macos-arm64" | "macos-x64" | "windows-x64" | "linux-x64";
interface ReleaseAsset { url: string; sha256: string; name: string; }
interface ReleaseManifest { version: string; platforms: Partial<Record<PlatformKey, ReleaseAsset>>; }

const manifestUrl = "https://github.com/B-Divyesh/sf-local-sync-observer/releases/latest/download/latest.json";

function detectPlatform(): PlatformKey {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent;
  const value = platform.toLowerCase();
  if (value.includes("win")) return "windows-x64";
  if (value.includes("mac")) return /arm|aarch64/.test(navigator.userAgent.toLowerCase()) ? "macos-arm64" : "macos-x64";
  return "linux-x64";
}

const labels: Record<PlatformKey, string> = {
  "macos-arm64": "Download for macOS (Apple silicon)",
  "macos-x64": "Download for macOS (Intel)",
  "windows-x64": "Download for Windows",
  "linux-x64": "Download for Linux"
};

async function resolveDownloads(): Promise<void> {
  const primary = document.querySelector<HTMLAnchorElement>("#primary-download");
  const note = document.querySelector<HTMLElement>("#download-note");
  const detected = detectPlatform();
  if (primary) primary.textContent = labels[detected];
  try {
    const response = await fetch(manifestUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error("Release manifest unavailable");
    const manifest = await response.json() as ReleaseManifest;
    const asset = manifest.platforms[detected];
    if (!asset) throw new Error("Platform build unavailable");
    if (primary) primary.href = asset.url;
    if (note) note.textContent = `${manifest.version} · ${asset.name} · SHA-256 published`;
    document.querySelectorAll<HTMLAnchorElement>(".platform-link").forEach((link) => {
      const platform = link.dataset.platform;
      const key: PlatformKey = platform === "windows" ? "windows-x64" : platform === "linux" ? "linux-x64" : detected.startsWith("macos") ? detected : "macos-arm64";
      const target = manifest.platforms[key];
      if (target) link.href = target.url;
    });
  } catch {
    if (note) note.textContent = "Latest release page · unsigned builds · checksums included";
  }
}

void resolveDownloads();
if ("serviceWorker" in navigator && location.protocol === "https:") void navigator.serviceWorker.register("/sw.js");
