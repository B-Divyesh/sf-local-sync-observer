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

The release candidate is `v0.1.2`. Hosted matrix, checksum, static deployment, and live identity evidence are recorded after publishing below.

## Known limits and operator action

- Syncthing is the only provider that can establish provider-backed convergence. Folder metadata alone remains `Unknown`.
- API keys stay in local WebView storage and are not application-level encrypted; use a dedicated, revocable key.
- Packages are unsigned. Signing requires owner-provided Apple and Windows certificates; the product has no updater and expects no signing secrets today.
