# Verification 4 — FAIL

Candidate: `e883742f0ad167371033eaa9b2f27f25b957d1b2`  
Live URL: <https://local-sync-observer.sociobot.in/>  
Verified: 2026-09-01 UTC

## Decision

**FAIL — release-blocking.** The deployed static site is an exact build match for
the candidate, but the downloadable desktop packages are from the older commit
`39df651917f50f887a25123575d7f9d82c2e6a21`, not this candidate. The difference
contains changes to `src-tauri/src/lib.rs`, `crates/observer-core`, and the
desktop and site tests. A visitor who installs the advertised current package
therefore does not receive the verified candidate desktop code.

## Release-blocking finding

| Severity | Check | Evidence | Required resolution |
| --- | --- | --- | --- |
| Release-blocking | Downloaded desktop package identity | GitHub Release `v0.1.2` `latest.json` records `sourceCommit` `39df651917f50f887a25123575d7f9d82c2e6a21`; candidate is `e883742f0ad167371033eaa9b2f27f25b957d1b2`. `git merge-base --is-ancestor 39df… e883…` returned success, and `git diff --name-status 39df…..e883…` includes core and Tauri source files. | Tag and publish a new desktop release built from `e883742…` (with a new version), then publish `latest.json` and `SHA256SUMS` whose `sourceCommit` is that commit. Re-run verification against that release. |

The published Linux `.deb` download itself is internally consistent: 2,815,622
bytes, SHA-256 `918d6a3481ca9507b8890012a13e918fe7755387c16f5a23dd040e552ec80e04`,
equal to its published `SHA256SUMS` entry. This confirms the issue is build
identity, not the published checksum.

## Claims

All 16 declared claim commands passed after `npm ci`, including each browser,
Vitest, and Rust claim. The clean checkout initially had no `node_modules`, so
the first browser command could not load `@playwright/test`; after the required
locked install it passed. This is an environment prerequisite, not a source
failure.

Passed IDs: `release-downloads`, `release-matrix`, `checksum-install`,
`evidence-boundary`, `metadata-only-scan`, `scan-bounds`,
`local-endpoint-only`, `local-app-storage`, `open-owner`,
`thirty-second-refresh`, `site-private`, `mit-license`, `isolated-demo`,
`demo-private`, `offline-demo-reload`, and `release-fallback`.

## Local quality checks

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 68 packages audited, 0 reported vulnerabilities. |
| `npm test` | Pass; 10 tests in 4 files. |
| `cargo test --manifest-path crates/observer-core/Cargo.toml` | Pass; 4 tests. |
| `npm run check` | Pass; TypeScript, 10 Vitest tests, production app and site builds. |
| `npm run test:e2e` | Pass in an idle checkout; 38 Playwright desktop/mobile checks. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Pass after installing the Linux packages declared by CI. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | Pass. |

The exact production build produced `dist/app` and `dist/site`. Initial site
JavaScript is 3,061 bytes gzip across the home and route modules; CSS is 3,121
bytes gzip; the loaded hero WebP is 82,064 bytes.

## Product and live checks

- **Cold first read: pass.** The first screen says “Check what synced after
  offline work,” names people using Syncthing, and offers one-click “Try it
  with sample data.” The action opened `/demo/` with the persistent demo banner,
  a Field notes conflict, Reset demo, and no real-data storage.
- **Representative flows: pass.** The test suite covered the empty state,
  keyboard dialog open/close, sample conflict, owner-tool handoff without
  altering the reading, 30-second refresh, provider-specific form fields,
  remote-endpoint rejection, metadata-only scans, conflict precedence, scan
  bounds, invalid source recovery, source removal, and demo reset/start-real.
- **Live candidate match: pass for the static deployment.** SHA-256 values for
  live `/`, `home--D_mFSnb.js`, `route-focus-CDiD8ht1.css`, and `/demo.js`
  exactly equal the fresh `dist/site` output from `e883742…`.
- **Privacy: pass.** Cold desktop and 390 px live request logs contained only
  the site origin and disclosed `https://api.github.com`; the demo contained
  only the site origin. Both contexts had no cookies and no page or console
  errors. The live offline demo reloaded its Field notes conflict after its
  first visit.
- **Accessibility and interaction: pass.** Desktop and 390 px live pages had
  exactly one `h1`, `lang=en`, `<main>`, no horizontal overflow, and a visible
  4 px blue focus outline. Reduced motion set transitions to `0.00001s`.
  Live axe checks at `/` and `/demo/` reported zero serious or critical items;
  the 38-check suite also covers app, legal, 200% zoom, 44 px targets, route
  focus, and mobile cases. No `verify-url.sh` is present in this checkout, so
  its title/lang/main/alt/console checks were independently performed with
  Playwright.
- **Headers and cache policy: pass.** The live document uses HSTS,
  `X-Content-Type-Options: nosniff`, strict referrer policy, permissions policy,
  and a CSP restricting connections to self plus the disclosed GitHub API.
  Hashed assets use `Cache-Control: public, max-age=31536000, immutable`.
- **Service worker: pass.** The live sample demo loaded from the service worker
  after offline reload.
- **Server-side allowance and sign-in: not applicable.** This is a static
  desktop/site product with no product server-side API or sign-in flow.

## Notes

No product code was changed during verification. The test-only Linux packages
were installed in this disposable verifier environment because they are the
repository CI prerequisites.
