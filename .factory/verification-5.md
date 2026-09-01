# Verification 5 — PASS

Candidate: `dc7691cf5c46cf803677d8f77c57452b07025f5b` (`v0.1.3`)  
Live URL: <https://local-sync-observer.sociobot.in/>  
Verified: 2026-09-01 UTC

## Decision

**PASS.** The live static site, published desktop release, sample demo, and
checked product behaviors match the candidate acceptance contract. No release-
blocking defects were found.

## First-read check

Cold opening `/` states that the product checks what synced after offline work,
identifies people using Syncthing as its audience, and presents **Try it with
sample data** as the first action. That one action opens `/demo/`, which shows a
realistic Field notes conflict plus the persistent “Demo — sample data, nothing
is saved” banner, Reset demo, and Start for real controls. This check passed on
desktop and at 390 px width.

## Required claim checks

`.factory/claims.json` exists and all 16 declared commands passed from this
clean checkout after `npm ci`. Browser claim commands were run through the
product demo entry points in isolated Playwright contexts.

| Claim IDs checked | Result |
| --- | --- |
| `release-downloads`, `release-matrix`, `checksum-install`, `evidence-boundary` | Pass |
| `metadata-only-scan`, `scan-bounds`, `local-endpoint-only` | Pass |
| `local-app-storage`, `open-owner`, `thirty-second-refresh`, `site-private` | Pass |
| `mit-license`, `isolated-demo`, `demo-private`, `offline-demo-reload`, `release-fallback` | Pass |

The checks confirmed the stated metadata-only file observation, scan limits,
local endpoint handling, local storage and removal, owner-tool opening,
30-second refresh, demo isolation, same-origin demo requests, offline demo
reload, and release fallback behavior.

## Local quality checks

| Check | Result |
| --- | --- |
| `npm ci` | Pass — 67 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | Pass — 11 tests in 4 files. |
| `npm run check` | Pass — TypeScript, unit tests, and exact app/site production builds. |
| `npm run test:e2e` | Pass — 40 Playwright checks across desktop and 390 px projects. |
| `cargo test --manifest-path crates/observer-core/Cargo.toml` | Pass — 4 tests. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Pass after installing the Linux build dependencies declared in the release workflow. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | Pass. |

The production output exists in `dist/app` and `dist/site`. The initial site
JavaScript is 1.01 KiB gzip, CSS is 3.12 KiB gzip, and the hero WebP is 80.1
KiB, within the stated static-site budgets.

## Product, privacy, accessibility, and deployment checks

- Representative normal, boundary, invalid-input, and recovery coverage passed
  through the app and browser suites: empty state, sample conflict, local source
  setup, remote endpoint rejection, removal, native-check unavailable state,
  conflict priority, scan bounds, reset, and owner-tool handoff.
- Live request recording found only the site origin and the disclosed
  `https://api.github.com` on `/`; `/demo/` used only the site origin. Both had
  no cookies, console errors, or page errors.
- Live `/demo/` reloaded while offline after its initial visit and retained the
  sample conflict, confirming the service-worker path.
- Live desktop and 390 px pages had one `h1`, `lang=en`, a `main` landmark, no
  horizontal overflow, and a visible `rgb(6, 69, 209) solid 4px` keyboard focus
  outline. Reduced-motion rendering changed the measured transition duration to
  `0.00001s`.
- Axe on live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` reported
  zero serious or critical findings. No `verify-url.sh` exists in this
  checkout, so its required title/lang/main/alt/console checks were performed
  directly with Playwright.
- Live responses include HSTS, `X-Content-Type-Options: nosniff`, strict
  referrer policy, permissions policy, and a CSP permitting only self plus the
  disclosed GitHub API. Hashed assets return `Cache-Control: public,
  max-age=31536000, immutable`.
- Fresh-build SHA-256 values exactly matched live `/`,
  `assets/home--D_mFSnb.js`, `assets/route-focus-CDiD8ht1.css`, and `demo.js`.

## Published desktop release

`node scripts/verify-release-identity.mjs /tmp/local-sync-observer-v013.json
v0.1.3 dc7691cf5c46cf803677d8f77c57452b07025f5b` passed: all six published
artifacts identify this exact source commit. The downloaded Linux package
`Local.Sync.Observer_0.1.3_amd64.deb` was 2,800,812 bytes and its SHA-256
`d3e0f9db3c1b5e631c2c88f48f0d634b32ca5b758ee70c0117e821b252e70b90`
matched `SHA256SUMS`. Its package metadata reports version `0.1.3`, architecture
`amd64`, and the expected local sync observer package identity.

The static product has no product server-side API or sign-in flow; request
allowance and identity-provider checks are therefore not applicable.

## Defects

No defects found.

## Evidence files

- `verification-evidence/verify-5-home-desktop.png`
- `verification-evidence/verify-5-home-mobile.png`
- `verification-evidence/verify-5-demo-desktop.png`
