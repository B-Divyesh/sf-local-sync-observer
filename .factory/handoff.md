# Local Sync Observer — polish round 2 handoff

## Status: PASS

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed. The repaired source is commit `375fd72f0b836e12e5deac74e18cd5dc13b928c8`, released as `v0.1.5`.

## Delivered

- Moved the real Syncthing probe into the shared Rust core. Controlled fixture tests now cover configured folders, local and remote pending counts, offline devices, conflict priority, last-good values, missing fields, coverage, GET-only requests, and unchanged files.
- Connected every rendered reading to the native Tauri tray. Its tooltip reports the state and attention count without paths or filenames.
- Added all public promises to `.factory/claims.json`; there are 21 independently runnable claim tests.
- Rewrote the first screen and remaining technical copy in plain words. The required action result and three facts remain visible on phone and desktop layouts.
- Made `/?demo=1` enter the isolated sample directly. Reset restores the sample, leaving removes only the demo namespace, and the exact query URL reloads offline.
- Preserved the product's black, field-paper, and safety-yellow visual system while fixing mobile flow, metadata, focus, external-link labels, legal navigation, and the styled 404 response.
- Added the deterministic copy audit, final catalog description, cumulative finding map, and verification evidence.

## Deployment and release

- Live site: <https://local-sync-observer.sociobot.in/>
- Direct demo: <https://local-sync-observer.sociobot.in/?demo=1>
- Release: <https://github.com/B-Divyesh/sf-local-sync-observer/releases/tag/v0.1.5>
- GitHub quality run `33570173270`: success.
- GitHub release run `33570174733`: success on Windows, Linux, Intel macOS, Apple silicon macOS, and manifest finalization.
- Published assets: `.msi`, `.exe`, `.AppImage`, `.deb`, Intel `.dmg`, Apple silicon `.dmg`, `SHA256SUMS`, and `latest.json`.
- `latest.json` identifies source commit `375fd72f0b836e12e5deac74e18cd5dc13b928c8`. A fresh download of `Local.Sync.Observer_0.1.5_amd64.deb` passed its published SHA-256 check.
- A cold Linux browser resolved the live primary button to the `v0.1.5` AppImage.

## Verification

- Fresh clone at the release commit: all 21 claim commands pass independently. See `.factory/polish-2-evidence/clean-claims-summary.txt`.
- `npm run check`: pass; 11 Vitest tests and both production builds.
- `npm run test:e2e`: pass; 44/44 desktop and 390 px browser tests.
- `npm run audit:copy:check`: pass; no sentence exceeds 22 words and no banned term remains.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: pass, 8/8.
- `cargo test --manifest-path src-tauri/Cargo.toml -j 1`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -j 1 -- -D warnings`: pass.
- Both Rust formatting checks: pass.
- Live `verify-url.sh`: pass with one `<h1>`, `lang`, `<main>`, alt text, and zero console errors.
- Live Axe 4.10.3 on home, demo, privacy, and terms: zero violations.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0.002, TBT 50 ms.
- Live route crawl: home, demo, privacy, terms, 404 artifact, assets, repository, issues, and latest release all return 200. An unknown path returns the designed 404 with HTTP 404.
- Cold live demo check: redirect, banner, sample, reset, storage separation, exit cleanup, same-origin requests, and offline reload all pass with no console errors.
- Budgets: initial site JavaScript 3.3 KB raw total, CSS 12.5 KB raw, hero WebP 82.1 KB.

Evidence is in `.factory/polish-2.md` and `.factory/polish-2-evidence/`.

## Known gaps and operator action

No review or acceptance finding remains. Release binaries are intentionally unsigned because code-signing certificates were not provided. Future signing requires operator-managed `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets and matching workflow support; the published checksums provide integrity verification meanwhile.

## Run locally

```sh
npm ci
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml -j 1
```
