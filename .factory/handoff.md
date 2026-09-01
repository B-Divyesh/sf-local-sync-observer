# Local Sync Observer — repair handoff

## Repair scope

This repairs every finding in `.factory/verification-2.md` for candidate `0f9671db2a5149780619c5df2695566310203ce4`, including the controller's Windows release requirement.

- Reproduced GitHub Actions run `33297898822`: PowerShell passed `tests/*.test.ts` literally and Vitest reported no test files. `npm test` now uses a cross-platform Vitest config, and CI runs `npm run check` on both Ubuntu and Windows.
- The release workflow checks out the requested tag, proves `HEAD` equals that tag, requires all four build jobs, and records the source commit in `latest.json`.
- Expanded `.factory/claims.json` from four entries to cover release identity, checksum enforcement, evidence boundaries, metadata safety, scan bounds, local endpoints, local storage/removal, 30-second refresh, owning-tool handoff, privacy, license, demo isolation, and offline reload.
- Exact regressions now require the mocked GitHub `browser_download_url`, run the real shell installer against good and bad hashes, and generate a complete fixture release manifest with all six package types in `SHA256SUMS`.
- Moved the 404 into Vite's build graph so it receives the hashed stylesheet. Its browser test requires styled output and no console/page errors.
- Removed the 320px layout floor and added narrow-layout rules for the effective 195px CSS viewport at 390px/200% zoom. A browser test requires no horizontal overflow and 44×44px visible controls.
- Added three captioned 900×600 captures of the real desktop UI: empty state, source setup, and sample conflict.
- Fixed the timer root cause: the desktop refresh interval now starts even when the first source is added after launch.
- Fixed site demo exit so **Start for real** clears only the demo namespace and preserves real observer data.
- Bumped app, package, release workflow, service-worker cache, and public footer versions to `0.1.2`.

## Local verification evidence

- `npm ci`: passed, 67 packages, 0 vulnerabilities.
- `npm run check`: passed; TypeScript, 10 Vitest tests, `dist/app`, and `dist/site`.
- `npm run test:e2e`: 34/34 passed across desktop Chromium and exact 390px mobile.
- Every exact command in `.factory/claims.json`: passed independently.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 5/5 passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `/opt/fleet/lib/verify-url.sh` passed on local `/` and `/demo/`: title, `lang`, one `h1`, `main`, alt text, button names, and zero console errors.
- Playwright axe integration found no serious or critical issues on landing, app, privacy, and terms routes at desktop and 390px mobile.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.8s, TBT 0ms, CLS 0.004, transfer 183 KiB.
- Production budgets: site JS 2,729 bytes; CSS 11,980 bytes; hero WebP 82,064 bytes; walkthrough WebPs 21,124–36,698 bytes and lazy-loaded.
- 404, 195px effective reflow, 44px targets, reduced motion, keyboard focus/Escape, offline reload/update, request origins, cookies, storage isolation, malformed/fallback states, and full platform fixture metadata are regression-covered.

## Release and deployment

The repaired release candidate is tag `v0.1.2`, built from commit `39df651917f50f887a25123575d7f9d82c2e6a21`.

- Hosted quality run [`33300352802`](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33300352802): Rust passed; web checks passed on both `ubuntu-latest` and `windows-latest`. This is the hosted regression for the original PowerShell literal-glob failure.
- Hosted release run [`33300353819`](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33300353819): both macOS architectures, Windows MSI/NSIS, Linux AppImage/DEB, and the metadata finalizer passed.
- Published release: [`v0.1.2`](https://github.com/B-Divyesh/sf-local-sync-observer/releases/tag/v0.1.2), non-draft and non-prerelease, with `target_commitish` equal to the repair commit.
- Downloaded every release asset and ran `sha256sum -c SHA256SUMS`: all six packages passed.

| Platform/package | Published SHA-256 |
| --- | --- |
| macOS arm64 `.dmg` | `78a6409821dfc5ddcc8c164f0cadecc8ca395a111f2e31eba2960c5c9d9a9e5d` |
| macOS x64 `.dmg` | `db374e8e52645306b8f2edefc9d117f78c1610f2b2b0c8e725e47e941b787a9d` |
| Windows x64 `.msi` | `92c971704c02430cc0ea35394c29555c23aa24fc5e926786b783872eb8efba3c` |
| Windows x64 `.exe` | `f970c7e36f96fe1c0b7789b1198677d7d08f9d0c99b0f6eeb79fbf04da590e64` |
| Linux x64 `.AppImage` | `7a94a4401d58214c7e82cad8b868f57fb35fd1910e0baf2b3044022d839b5583` |
| Linux x64 `.deb` | `918d6a3481ca9507b8890012a13e918fe7755387c16f5a23dd040e552ec80e04` |

`latest.json` reports `v0.1.2`, the exact source commit, four platform keys, real package URLs, and the same primary-package hashes. Package inspection identified a valid x86-64 AppImage, Debian package `local-sync-observer` version `0.1.2`, x64 MSI, NSIS executable, and both disk images.

The matching `dist/site` was deployed with `/opt/fleet/lib/deploy-static.sh local-sync-observer /work/repo/dist/site`; deployment ID `6b096a3a-ec17-4bde-979f-9217cfb43278` succeeded. Live checks at `https://local-sync-observer.sociobot.in` found:

- `/` and `/demo` return 200 with the correct title, language, one `h1`, main landmark, complete image alternatives, and zero console errors.
- The Linux-detected primary action resolves to the published `v0.1.2` AppImage and displays its release/package metadata.
- The direct `/404.html` artifact is styled and has no console error; an unknown route returns HTTP 404 with that artifact.
- At the 195 CSS-pixel effective viewport used to model 390px at 200% zoom: no horizontal overflow and no visible control smaller than 44px.
- Axe found no serious or critical landing-page issues. The demo reloaded from its service-worker cache while offline.
- CSP permits only the documented GitHub API connection, forbids framing, and has no inline-policy violation. Hashed assets return one-year immutable caching; HTML returns `no-cache`.
- Live `install.sh` and `install.ps1` byte hashes equal the deployed build. Ten representative HTML, script, style, installer, and walkthrough assets matched local SHA-256 exactly.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.203s, TBT 56ms, CLS 0.004, transfer 186,244 bytes.

## Known limits and operator action

- Syncthing is the only provider that can establish provider-backed convergence. Folder metadata alone remains `Unknown`.
- API keys stay in local WebView storage and are not application-level encrypted; use a dedicated, revocable key.
- Packages are unsigned. Signing requires owner-provided Apple and Windows certificates; the product has no updater and expects no signing secrets today.

## Independent verification — 2026-09-01

**PASS** for candidate `0afba5905f284fa62451a63328b344b3f6e450e3` at `https://local-sync-observer.sociobot.in`.

- Fresh `npm ci`, every one of the 15 exact claim commands, `npm run check`, 34/34 Playwright tests at desktop and 390 px mobile, Rust tests, formatting, and warning-free clippy passed.
- The production site build was byte-for-byte identical to live `/`, `/demo`, hashed JS, and hashed CSS. The published v0.1.2 release has macOS, Windows, and Linux artifacts; a fresh Linux DEB checksum check passed.
- Live browser QA found clear first-read copy and one-click sample data, zero console/page errors, no axe serious/critical findings, visible keyboard focus, reduced-motion compliance, same-origin demo requests, and the documented GitHub API request only on the landing page. Security headers and immutable hashed-asset caching were present.
- The local Tauri bundle reaches binary, DEB, and RPM output but AppImage packaging cannot finish in this disposable container because its `linuxdeploy` helper needs an unavailable FUSE device. The published v0.1.2 AppImage was independently present; this is an environment limit, not a product defect.

See `.factory/verification-3.md` for the complete independent evidence and caveats.
