# Verification 6 — PASS

Candidate: `375fd72f0b836e12e5deac74e18cd5dc13b928c8` (`v0.1.5`)  
Live URL: <https://local-sync-observer.sociobot.in/>  
Verified: 2026-09-02 UTC

## Decision

**PASS.** The live website, one-click isolated demo, public desktop release,
and local production build meet the researched brief and the factory
acceptance contract. No release-blocking defects were found.

## Cold first read

A fresh browser visit states **“Check what synced after offline work.”** It
identifies the audience in plain words: people using Syncthing who need
pending files, conflicts, and local-device status in one place. The first
primary action is **“Try it with sample data”**, with the adjacent explanation
that it opens a sample conflict board and saves nothing. One click opens the
Field notes conflict demo, whose persistent banner has Reset demo and a
real-data exit path. This passed at desktop width and 390 px mobile width.

## Clean checkout, claims, and local quality gates

`npm ci` installed the pinned 67 packages with zero audit vulnerabilities.
All 21 records in `.factory/claims.json` were exercised using their declared
commands and passed:

| Claim group | Result |
| --- | --- |
| `release-downloads`, `local-app-storage`, `open-owner`, `thirty-second-refresh`, `site-private`, `isolated-demo`, `demo-private`, `offline-demo-reload`, `release-fallback`, `tray-status`, `no-product-account` | Pass — declared Playwright commands; demo/browser contexts used. |
| `release-matrix`, `checksum-install`, `evidence-boundary`, `mit-license` | Pass — declared Vitest commands. |
| `metadata-only-scan`, `scan-bounds`, `local-endpoint-only`, `syncthing-reading`, `reading-details`, `read-only-probe` | Pass — declared deterministic Rust commands. |

Additional quality checks:

| Check | Result |
| --- | --- |
| `npm run check` | Pass — TypeScript, 11 Vitest tests, and production `dist/app` plus `dist/site` builds. |
| `cargo test --manifest-path crates/observer-core/Cargo.toml` | Pass — 8 tests. |
| `npm run test:e2e` | Pass — 44 desktop/mobile Playwright tests; `test-results/.last-run.json` records `passed`. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | Pass. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Pass. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `CI=true npm run tauri -- build --bundles deb` | Pass — produced `Local Sync Observer_0.1.5_amd64.deb`, package `local-sync-observer`, version `0.1.5`, architecture `amd64`. |

The initial production site JavaScript is 1.11 KiB gzip and CSS is 3.20 KiB
gzip; the hero WebP is 82,064 bytes. All are within the static budget. The
initial native command inherited `CI=1`, which Tauri rejects as an invalid
boolean. Repeating it with the documented Boolean `CI=true` passed; this is a
worker-environment quirk, not a source or release defect.

## Product behavior

The automated and manual flows covered the empty board, keyboard-opened and
Escape-closed source dialog, sample conflict, reset and exit from the isolated
demo, local source save/removal, invalid remote endpoint rejection, folder
source control changes, unavailable native-check recovery, 30-second refresh,
tray status, conflict priority, metadata-only scanning, scan bounds, and
opening the owning local sync tool without changing the reading. These are
consistent with the brief's read-only, evidence-bound observer role.

## Live deployment, privacy, security, and accessibility

- Fresh generated `dist/site/index.html` and every referenced home asset were
  byte-identical to production. `demo.js`, `sw.js`, both installers,
  `robots.txt`, and `sitemap.xml` also matched exactly.
- A fresh live landing visit contacted only the product origin and the
  disclosed `https://api.github.com` release API. A fresh demo visit and an
  offline demo reload contacted only the product origin. Both had no cookies,
  console errors, or page errors. The demo retained its Field notes conflict
  after service-worker-controlled offline reload.
- Responses provide CSP with `connect-src 'self' https://api.github.com`, HSTS,
  `nosniff`, strict referrer policy, permissions policy, and
  `frame-ancestors 'none'`. A hashed JS asset returns `Cache-Control: public,
  max-age=31536000, immutable`; HTML uses short revalidation caching.
- Axe Core, injected into Playwright with CSP bypass only for testing, found
  zero serious or critical findings on `/`, `/demo/`, `/privacy/`, `/terms/`,
  and `/404.html`. The standalone Axe CLI could not locate Chrome in this
  container, so the already-installed Playwright Chromium was used instead.
- Desktop and 390 px demo checks had one h1, no horizontal overflow, visible
  `rgb(6, 69, 209) solid 4px` focus outlines, keyboard-operable controls, no
  console/page errors, and reduced-motion transition duration of `0.00001s`.
- Mobile Lighthouse on the live home: Performance **96**, Accessibility
  **100**, Best Practices **100**, SEO **100**; LCP 1,233 ms and CLS 0.0020.
- Every landing-page destination, including the detected platform asset and
  public legal/demo routes, returned HTTP 200.

## Published desktop release and identity

The public GitHub release is `v0.1.5`, published 2026-09-01 23:23 UTC. Its
`latest.json` passed:

```text
node scripts/verify-release-identity.mjs /tmp/lso-latest.json v0.1.5 375fd72f0b836e12e5deac74e18cd5dc13b928c8
Verified v0.1.5: 6 artifacts identify source commit 375fd72f0b836e12e5deac74e18cd5dc13b928c8.
```

It contains both macOS DMGs, Windows MSI/NSIS, and Linux AppImage/DEB assets.
The downloaded `Local.Sync.Observer_0.1.5_amd64.deb` has SHA-256
`3c1fcb3df8045130d8b0a7bc1bf18db619bc702f15117ee4b99b5eaaa8ff6c10`, exactly
matching the release manifest, and reports the expected package identity.

The product has no server-side product API or sign-in flow; API rate-limit and
Entra tenant checks are not applicable.

## Defects

None found.
