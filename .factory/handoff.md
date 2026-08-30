# Local Sync Observer — verification handoff

## Release decision

**FAIL — do not release candidate `1313d781ab40a7b3fe4c950a080a2163321ce925`.**

Independent verification ran on 2026-08-30 against the clean candidate and `https://local-sync-observer.sociobot.in`. The live static files match the candidate build byte-for-byte. Full evidence is in [`.factory/verification.md`](verification.md).

Release blockers:

1. `.factory/claims.json` is missing, so the mandatory claims gate cannot run and all public claims are unregistered.
2. The first screen has no one-click `Try it with sample data` action; `/demo` is the home fallback, `.factory/demo.md` is missing, and the in-app example is not isolated from real storage.
3. The live page fetches `github.com/.../releases/latest/download/latest.json`, which is blocked by CORS and logs two console errors. Platform buttons remain generic release-page links.
4. The released Linux app displays the inactive Folder metadata form while Syncthing is selected; its `Choose…` button remains operable and the extra controls push `Save and inspect` below the initial dialog viewport.
5. `/privacy/` and `/terms/` each have an axe serious `link-name` failure at 390 px.

Additional gaps: no CSP/frame restriction, real 404, robots, sitemap, static-host configuration, canonical/social image/Twitter metadata, favicon, footer build ID, immutable asset caching, or `.factory/copy-audit.md`; several mobile/footer targets are below 44 px.

Passing evidence: `npm ci`, `npm test` (4/4), `npm run check`, `npm run build`, `npm run test:e2e` (12/12), Rust format/test (3/3)/clippy, exact deployment hashes, active/offline service worker reload, performance budget (Lighthouse 93; LCP 2.3 s; CLS 0.004; 87 KiB transfer), release platform matrix, and the downloaded Linux AppImage checksum. A real native flow against a local mock Syncthing API detected an introduced conflict, recovered to Converged, and refused convergence when a configured peer went offline.

## Required next work

Add claim tests and a documented isolated demo; move release metadata lookup to the CORS-enabled GitHub API; fix the dialog’s hidden state and add regression coverage in WebKit-sized layout; fix legal-page mobile link names; add required routing/metadata/security/cache files and touch targets; then rerun this independent verification.

---

## Original builder handoff

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
