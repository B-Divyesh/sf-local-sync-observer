type DesktopPlatformKey = "macos-arm64" | "macos-x64" | "windows-x64" | "linux-x64";
type PlatformKey = DesktopPlatformKey | "mobile";
interface GitHubAsset { name: string; browser_download_url: string; }
interface GitHubRelease { tag_name: string; target_commitish: string; assets: GitHubAsset[]; }
interface CachedRelease { cachedAt: number; release: GitHubRelease; }

const releaseApiUrl = "https://api.github.com/repos/B-Divyesh/sf-local-sync-observer/releases/latest";
const releasePageUrl = "https://github.com/B-Divyesh/sf-local-sync-observer/releases";
const releaseCacheKey = "local-sync-observer.release.v1";
const cacheMs = 60 * 60 * 1000;

function detectPlatform(): PlatformKey {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? "";
  const value = `${platform} ${navigator.userAgent}`.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(value)) return "mobile";
  if (value.includes("win")) return "windows-x64";
  if (value.includes("mac")) return /arm|aarch64/.test(navigator.userAgent.toLowerCase()) ? "macos-arm64" : "macos-x64";
  return "linux-x64";
}

const labels: Record<DesktopPlatformKey, string> = {
  "macos-arm64": "Download for macOS (Apple silicon) from GitHub",
  "macos-x64": "Download for macOS (Intel) from GitHub",
  "windows-x64": "Download for Windows from GitHub",
  "linux-x64": "Download for Linux from GitHub"
};

async function resolveDownloads(): Promise<void> {
  const primary = document.querySelector<HTMLAnchorElement>("#primary-download");
  const note = document.querySelector<HTMLElement>("#download-note");
  const mobileHandoff = document.querySelector<HTMLElement>("#mobile-handoff");
  const detected = detectPlatform();
  if (detected === "mobile") {
    primary?.removeAttribute("href");
    if (primary) primary.hidden = true;
    if (mobileHandoff) mobileHandoff.hidden = false;
    if (note) note.hidden = true;
    return;
  }
  if (primary) {
    primary.hidden = false;
    primary.textContent = labels[detected];
  }
  try {
    const cached = readCachedRelease();
    const release = cached ?? await fetchRelease();
    const asset = findAsset(release.assets, detected);
    if (!asset) throw new Error("Platform build unavailable");
    if (primary) primary.href = asset.browser_download_url;
    if (note) note.textContent = `${release.tag_name} · ${asset.name}`;
    document.querySelectorAll<HTMLAnchorElement>(".platform-link").forEach((link) => {
      const platform = link.dataset.platform;
      const key: PlatformKey = platform === "windows" ? "windows-x64" : platform === "linux" ? "linux-x64" : detected.startsWith("macos") ? detected : "macos-arm64";
      const target = findAsset(release.assets, key);
      if (target) {
        link.href = target.browser_download_url;
        if (link.dataset.downloadLabel) link.textContent = link.dataset.downloadLabel;
      }
    });
  } catch {
    if (primary) {
      primary.hidden = true;
      primary.removeAttribute("href");
    }
    document.querySelectorAll<HTMLAnchorElement>(".platform-link").forEach((link) => {
      link.href = releasePageUrl;
      link.innerHTML = `Open releases on GitHub <span class="visually-hidden">(external site)</span>`;
    });
    if (note) note.innerHTML = `Downloads are being published. <a href="https://github.com/B-Divyesh/sf-local-sync-observer/releases">Open releases on GitHub <span class="visually-hidden">(external site)</span></a>.`;
  }
}

function readCachedRelease(): GitHubRelease | null {
  try {
    const cached = JSON.parse(localStorage.getItem(releaseCacheKey) ?? "null") as CachedRelease | null;
    if (!cached || !Number.isFinite(cached.cachedAt) || !cached.release) {
      localStorage.removeItem(releaseCacheKey);
      return null;
    }
    if (Date.now() - cached.cachedAt >= cacheMs) {
      localStorage.removeItem(releaseCacheKey);
      return null;
    }
    if (!isCurrentRelease(cached.release)) {
      localStorage.removeItem(releaseCacheKey);
      return null;
    }
    return cached.release;
  } catch {
    localStorage.removeItem(releaseCacheKey);
    return null;
  }
}

async function fetchRelease(): Promise<GitHubRelease> {
  const response = await fetch(releaseApiUrl, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error("Release metadata unavailable");
  const release = await response.json() as GitHubRelease;
  if (!isCurrentRelease(release)) throw new Error("Release does not match this site build");
  localStorage.setItem(releaseCacheKey, JSON.stringify({ cachedAt: Date.now(), release } satisfies CachedRelease));
  return release;
}

function isCurrentRelease(release: GitHubRelease): boolean {
  return release.tag_name === `v${__APP_VERSION__}` && release.target_commitish === __SOURCE_COMMIT__;
}

function findAsset(assets: GitHubAsset[], platform: DesktopPlatformKey): GitHubAsset | undefined {
  const patterns: Record<DesktopPlatformKey, RegExp> = {
    "macos-arm64": /aarch64.*\.dmg$/i,
    "macos-x64": /(x64|x86_64).*\.dmg$/i,
    "windows-x64": /x64.*\.msi$/i,
    "linux-x64": /(amd64|x86_64).*\.AppImage$/i
  };
  return assets.find((asset) => patterns[platform].test(asset.name));
}

const requestedDemo = location.pathname === "/" && new URLSearchParams(location.search).get("demo") === "1";
if (requestedDemo) {
  location.replace("/demo/?demo=1");
} else {
  void resolveDownloads().finally(() => document.dispatchEvent(new Event("local-sync-observer:layout-ready")));
  if ("serviceWorker" in navigator && location.protocol === "https:") void navigator.serviceWorker.register("/sw.js");
}
