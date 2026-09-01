# Local Sync Observer — verification 5 handoff

## Status: PASS

Independent verification accepted candidate
`dc7691cf5c46cf803677d8f77c57452b07025f5b` (`v0.1.3`) at
<https://local-sync-observer.sociobot.in/>. The published static site and all
six release artifacts identify that exact candidate. Full evidence is in
`.factory/verification-5.md`.

Release target: `v0.1.3` at the exact commit returned by
`git rev-list -n 1 v0.1.3`. The static deployment is built from that same tagged
tree. The app remains a Tauri 2 desktop product with a static landing site.

## Release blocker reproduced

The verifier's failure was reproduced before changes by downloading the public
`v0.1.2` `latest.json`. It reported source commit
`39df651917f50f887a25123575d7f9d82c2e6a21`, while the verified candidate was
`e883742f0ad167371033eaa9b2f27f25b957d1b2`. The release was internally
checksummed, but it did not contain the later native and observer-core changes.

## Repair

- Bumped the desktop and site release to `0.1.3`.
- Made the release job reject a tag that does not match the package version or
  the checked-out commit.
- Added `scripts/verify-release-identity.mjs`. Finalization now stops unless
  `latest.json`, all four platform selections, and every downloadable package
  identify the tag's exact 40-character source commit.
- Added every DMG, MSI, EXE, AppImage, and DEB to the manifest with its URL,
  SHA-256, and source commit. `SHA256SUMS` is generated from the same records.
- Embedded the full source commit in the desktop UI build. The footer exposes
  the version and short build ID; its accessible label and title contain the
  complete commit.
- Added a regression that feeds the exact stale `39df651…`/`e883742…` mismatch
  to the verifier and requires rejection. Browser coverage also checks that the
  desktop build exposes its exact Git commit.

## Verification evidence

Run from a clean checkout:

```sh
npm ci
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

Observed on 2026-09-01 UTC:

- `npm ci`: 67 packages installed; 0 reported vulnerabilities.
- `npm test`: 11/11 Vitest checks passed, including stale-release rejection.
- `npm run check`: TypeScript, unit tests, app build, and site build passed.
- `npm run test:e2e`: 40/40 Playwright checks passed across desktop and 390 px
  mobile projects.
- All 16 commands in `.factory/claims.json` passed independently.
- Observer core: 4/4 Rust tests passed. Tauri: 1/1 Rust test passed.
- Strict Clippy and `cargo fmt --check` passed.
- Production output exists at `dist/app` and `dist/site`.
- Initial site JavaScript is 1.57 KiB gzip, CSS is 3.12 KiB gzip, and the hero
  WebP is 80.1 KiB.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.8 s, CLS 0.004, total transfer 184 KiB. Lighthouse did not
  report lab INP for the static first load.

The Playwright matrix covers keyboard dialog use, visible focus, one heading,
route focus, 200% reflow, 44 px controls, desktop and mobile Axe scans, no
console errors, isolated demo storage, same-origin demo requests, offline demo
reload, release API failure, and the exact source-build identity. Axe found no
serious or critical issues.

## Published-release verification

The release is accepted only when these commands succeed:

```sh
candidate="$(git rev-list -n 1 v0.1.3)"
curl -fsSL https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/latest.json -o /tmp/local-sync-observer-latest.json
node scripts/verify-release-identity.mjs /tmp/local-sync-observer-latest.json v0.1.3 "$candidate"
curl -fsSL https://github.com/B-Divyesh/sf-local-sync-observer/releases/download/v0.1.3/SHA256SUMS -o /tmp/local-sync-observer-SHA256SUMS
```

The release workflow builds macOS arm64 and Intel DMGs, Windows MSI and EXE,
and Linux AppImage and DEB packages on GitHub-hosted platform runners. No
desktop package is built in the factory worker.

## Live checks

Live URL: <https://local-sync-observer.sociobot.in/>. The expected network
policy is same-origin assets plus the disclosed GitHub releases API on the home
page; `/demo/` is same-origin only. The site has no analytics, cookies, account,
payment, or model requests. The service worker supports the registered offline
demo claim.

## Known gaps and operator action

Desktop packages are unsigned. macOS notarization needs `APPLE_CERTIFICATE` and
Windows Authenticode needs `WINDOWS_CERT_PFX`; neither secret is present or
required for this unsigned release. Users receive the existing unsigned-build
instructions. No updater is included, so no updater manifest is published.
