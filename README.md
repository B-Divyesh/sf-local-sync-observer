# Local Sync Observer

Local Sync Observer is a free, local-only desktop utility for people who use Syncthing and need one clear answer after offline work: have the folders and devices actually converged?

It is intentionally an observer, not a sync engine. v0.1 reads Syncthing’s local REST status and scans selected folder metadata for common conflict-copy names. It never opens file contents, sends telemetry, or changes a file. When something needs attention, it opens the owning tool for the fix.

Live site: <https://local-sync-observer.sociobot.in>

Try the isolated sample before installing: <https://local-sync-observer.sociobot.in/demo/>. It shows a realistic conflict reading and uses a separate demo storage key, so it never reads or changes real observer data.

## Install

Download the build detected for your operating system from the website, or use:

```sh
curl -fsSL https://local-sync-observer.sociobot.in/install.sh | sh
```

On Windows PowerShell:

```powershell
irm https://local-sync-observer.sociobot.in/install.ps1 | iex
```

The scripts fetch `latest.json`, download the matching GitHub Release asset, and verify its SHA-256 checksum before installing or opening it. v0.1 packages are unsigned. On macOS, control-click the app and choose **Open** the first time; Windows may show a SmartScreen prompt.

## Use

1. Open **Configure sources**.
2. Choose Syncthing and enter its local URL plus the API key from **Actions → Settings → General**, or choose a folder for metadata-only observation.
3. Select **Save and inspect**. The board checks again every 30 seconds while running.
4. If the reading is pending, conflicted, unavailable, or unknown, inspect the coverage note and use **Open owning tool** to resolve it there.

Syncthing endpoints must be loopback addresses or `.local` hosts. Folder scans inspect names and metadata for at most 50,000 entries and 16 levels. Folder scans can flag common conflict copies but do not claim convergence without provider evidence.

## Develop

Prerequisites: Node.js 22, npm, current stable Rust, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your operating system.

```sh
npm ci
npm run dev          # desktop UI in a browser
npm run dev:site     # landing site
npm run tauri dev    # complete native app
```

The static deployment build command is exactly:

```sh
npm run build:site   # output: dist/site, with index.html at its root
```

`npm run build` builds both `dist/app` and `dist/site`.

## Test and verify

```sh
npm run check        # TypeScript, unit tests, app and site builds
npm run test:e2e     # Playwright desktop/mobile and axe checks
cargo test --manifest-path src-tauri/Cargo.toml
```

The release workflow runs on `v*` tags and manual dispatch. It builds macOS arm64/x64 DMGs, Windows MSI/NSIS packages, and Linux AppImage/DEB packages, then publishes `SHA256SUMS` and `latest.json` with the release.

## Demo and claims

The one-click demo is documented in [`.factory/demo.md`](.factory/demo.md). Its observable product promises and the exact command that checks each one are in [`.factory/claims.json`](.factory/claims.json). The landing page requests CORS-safe release metadata from `api.github.com`; if it is unavailable, it shows a release-page link without failing the page.

## Privacy and security

Source labels, paths, endpoints, API keys, and cached readings are stored in the app WebView’s local storage. API keys are local but not encrypted by v0.1; use a dedicated/revocable Syncthing key and remove the source when it is no longer needed. The website has no analytics or cookies. See [Privacy](https://local-sync-observer.sociobot.in/privacy/) and [Terms](https://local-sync-observer.sociobot.in/terms/).

## Project notes

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and original image provenance: [`.factory/design.md`](.factory/design.md)
- Build and verification handoff: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
