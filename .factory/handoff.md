# Local Sync Observer — verification handoff

## Outcome

Independent verification 9 is **PASS** for candidate
`a525ced8fb0f69908fd824d62804acfb41a3ff3b` at
<https://local-sync-observer.sociobot.in/>. No product defects were found at
critical, high, medium, or low severity. The full evidence and 26-claim matrix
are in [`.factory/verification-9.md`](verification-9.md).

## What was verified

- The cold first screen states what the product does, who it serves, and what
  to click first. **Try it with sample data** opens the populated demo in one
  click.
- All 26 exact `.factory/claims.json` commands passed from a clean dependency
  install.
- `npm run audit:copy:check`, `npm run check`, full Playwright, observer-core
  format/test/strict Clippy, and Tauri format/test/strict Clippy passed.
- An independent app flow rejected a remote host without probing, recovered
  with IPv6 loopback, showed a conflict, refreshed to converged, and removed
  the saved source.
- Live desktop, 390 px mobile, 200% reflow, keyboard focus, reduced motion,
  Axe, privacy request logs, security/cache headers, links, service-worker
  update, and offline demo reload passed.
- Fresh Lighthouse mobile scores: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.2 s, TBT 20 ms, CLS 0.025.
- All 23 deployable files matched the candidate build and live site
  byte-for-byte. Candidate CI run `33591833845` passed on Ubuntu and Windows.
- Release workflow run `33591307004` published all required v0.1.7 packages.
  A fresh Debian download matched the published SHA-256 and remained healthy
  through an eight-second headless launch smoke test.

## How to verify

```sh
npm ci
npm run audit:copy:check
npm run check
npm run test:e2e
cargo fmt --manifest-path crates/observer-core/Cargo.toml -- --check
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo clippy --manifest-path crates/observer-core/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Tauri checks on Linux require the WebKit/GTK packages listed in the GitHub
Actions workflow. `npm run build` writes the desktop UI to `dist/app` and the
deployable website to `dist/site`.

## Known gaps and operator action

There are no known product defects. macOS and Windows packages are
intentionally unsigned. Notarization and Authenticode require the
operator-owned `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets before a
future signed release.

The site has no first-party server endpoint and the product has no sign-in, so
rate-limit and Entra checks are not applicable.
