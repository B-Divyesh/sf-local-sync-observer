# Local Sync Observer — build handoff

## What was built

- Tauri 2 desktop tray app with a Vite/TypeScript interface and native Rust commands.
- Opt-in Syncthing integration that reads local REST folder configuration, connected-device completion and `needItems`, then inspects configured folder names/metadata for common conflict copies.
- Generic folder observer that checks names and timestamps without opening content. Scans are capped at 50,000 entries and 16 levels and never claim convergence on metadata alone.
- Evidence states for converged, pending, conflict, offline, error, unknown, loading, and empty setup. Each includes a plain-language explanation and coverage boundary.
- Local source setup, 30-second refresh, cached last reading, removal flow, example preview, responsive 390 px layout, keyboard-native dialogs, and links back to the owning tool.
- Platform-detecting landing page, local-only privacy and terms pages, checksum-verifying shell/PowerShell installers, service-worker caching, and an original generated/optimized convergence illustration.
- GitHub Actions CI plus a tag/manual release matrix for macOS arm64/x64 DMGs, Windows MSI/NSIS, and Linux AppImage/DEB. The final job publishes `SHA256SUMS` and `latest.json` via `softprops/action-gh-release`.

## How to run and verify

```sh
npm ci
npm run check
npm run test:e2e
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri dev
```

Static deploy command: `npm run build:site`. Deploy directory: `dist/site`.

Verified in the factory worker on 2026-08-28:

- `npm audit`: 0 vulnerabilities.
- `npm test`: 4/4 unit tests passed.
- `npm run test:e2e`: 12/12 Playwright tests passed across Desktop Chrome and a 390 px mobile profile, covering both the site and app plus axe serious/critical checks.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 3/3 native tests passed.
- `npm run check`: passed; `dist/app` and `dist/site` produced.
- Initial JavaScript: 2.10 KB landing / 18.54 KB app (uncompressed); CSS: 9.05 KB landing / 10.67 KB app; hero WebP: 84 KB.
- Native packaging passed locally for both `Local Sync Observer_0.1.0_amd64.deb` and `Local Sync Observer_0.1.0_amd64.AppImage`.
- Hosted GitHub Actions quality run `33158507311` passed both the web and Rust jobs.
- Hosted release run `33158508334` passed for macOS arm64/x64, Windows x64, and Linux x64; the public [v0.1.0 release](https://github.com/B-Divyesh/sf-local-sync-observer/releases/tag/v0.1.0) contains DMG, MSI, NSIS EXE, AppImage, and DEB assets plus `latest.json` and `SHA256SUMS`.
- The Linux AppImage was downloaded from the URL in the public `latest.json` and verified successfully against the published `SHA256SUMS`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 96, SEO 92; LCP 1.5 s, total blocking time 0 ms, CLS 0.004.
- Manual visual review: desktop landing, 390 px landing, desktop app empty state, and 390 px app empty state.

## Known gaps and honest limits

- Provider-specific convergence is implemented for Syncthing only. Nextcloud and Resilio are future adapters; their local folders can use metadata-only observation today.
- Conflict detection recognizes common filename patterns. It cannot detect semantic conflicts that a provider does not expose.
- A hidden WebView can be timer-throttled by an operating system; the current tray app refreshes while running but does not install a background daemon.
- API keys are local but stored in WebView local storage without application-level encryption. The UI and privacy page disclose this.
- The observer does not auto-update, so no updater manifest is shipped.

## Needs operator action

1. Deploy `dist/site` to `https://local-sync-observer.sociobot.in`; do not change DNS or infrastructure from this repo.
2. v0.1 intentionally ships unsigned. To sign later, provision `APPLE_CERTIFICATE` (plus certificate password, signing identity, Apple ID/app password, and team ID) and `WINDOWS_CERT_PFX` (plus its password), then wire those secrets into the release workflow. No signing secret is currently referenced.

## Asset provenance

`assets/src/convergence-board.png` was generated for this product on 2026-08-28 with `/opt/fleet/lib/gen-image.sh` using the factory image deployment. The exact prompt is in `assets/src/convergence-board.prompt.json`; generated metadata is retained beside it. The shipping WebP and JPEG are optimized derivatives. The app icon is an original hand-authored SVG in `assets/src/app-icon.svg` with generated platform sizes under `src-tauri/icons/`.
