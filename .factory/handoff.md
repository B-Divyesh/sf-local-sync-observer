# Local Sync Observer — polish round 1 handoff

Repair base commit: `b00dc26`.

## What changed

- Moved folder scanning and endpoint validation into `crates/observer-core`, a dependency-free Rust crate used by the Tauri app. The three Rust claim commands now run after a plain clean-clone `npm ci`; they do not need GLib or WebKit development packages.
- Completed the claims registry with a release-fallback claim. Removed untestable timing, package-signing, provider-version, and blanket-checksum marketing promises.
- Added complete route metadata, a shared header/footer, route-load focus and live announcement, a styled metadata-complete 404, plain section headings, and clearer README copy.
- Deployed the static build to `https://local-sync-observer.sociobot.in` using the product-scoped Static Web Apps application `sf-local-sync-observer`.

## Verification

- Clean clone: `git clone --no-local /work/repo /tmp/lso-clean-UclbMG && npm ci`.
- Every command in `.factory/claims.json`: passed independently (16/16). Individual logs: `/tmp/lso-claim-<id>.log`.
- `npm run check`: pass — TypeScript, 10 Vitest tests, app build, site build.
- `npm run test:e2e`: pass — 38 Playwright desktop/mobile checks, including axe.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: pass — 4 tests.
- After installing the CI-declared Linux Tauri packages: `cargo test --manifest-path src-tauri/Cargo.toml`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`, and `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: pass.
- Cold live Playwright check at 390 × 844: `/`, `/demo/`, `/privacy/`, `/terms/`, and `/does-not-exist` each had one focused `h1`, zero serious/critical axe violations, and complete route metadata. Screenshots: `.factory/verification-evidence/polish-1-live-home.png` and `.factory/verification-evidence/polish-1-live-404.png`.
- Live unknown route returns HTTP 404. Chromium reports the browser-generated document-load message `Failed to load resource: the server responded with a status of 404 ()`; there are no application, CSP, stylesheet, script, or other subresource errors. This is intrinsic to retaining an actual 404 response in Chromium.

## Run locally

```sh
npm ci
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
```

For native Tauri tests on Linux, install the packages listed in `.github/workflows/ci.yml` first.

## Known gaps

None in the shipped product. Desktop release packages remain version `v0.1.2`; this repair changes the static site and dependency-free test structure, not the published package behavior.
