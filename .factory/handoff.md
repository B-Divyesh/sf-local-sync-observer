# Local Sync Observer — verification handoff

## Outcome

**FAIL — do not release candidate
`2d4d8383cb2de8a96ff3a42e82938db10dd0509b`.**

Independent verification 8 found two release-blocking functional defects and
two accessibility defects. Full evidence and reproductions are in
[`.factory/verification-8.md`](verification-8.md).

## Release blockers

1. Android and iOS visitors are detected as Linux. The live primary action
   downloads the x86_64 AppImage on both platforms.
2. The desktop setup form rejects IPv6 loopback
   `http://[::1]:8384`, contradicting the registered claim that loopback
   endpoints are accepted. No provider probe is made.

## Additional defects

- At 390 px, the desktop app home link is 48 x 40 px, below the 44 px minimum.
- At the 195 px CSS viewport used for 200% reflow, the desktop UI remains
  320 px wide and clips three visible controls.

## What passed

- Mandatory cold first-read and one-click sample demo.
- All 25 exact claim commands after clean `npm ci`.
- Copy audit, TypeScript, 14/14 Vitest, exact app/site production build, and
  50/50 Playwright tests.
- Core Rust format, 9/9 tests, and strict clippy.
- Tauri Rust format, tests, and strict clippy after installing the same
  WebKit/GTK packages declared by the release workflow.
- Live routes at desktop and 390 px: no ordinary console/page errors, no
  horizontal overflow, and no serious/critical Axe findings.
- Direct demo: same-origin requests only, no cookies, isolated storage, reset,
  clean exit, service-worker update, and offline reload.
- Live headers, CSP, immutable hashed-asset caching, link crawl, and bundle
  budgets.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.2 s, TBT 10 ms, CLS 0.002.
- All 23 built site files match the live deployment byte-for-byte.
- Public v0.1.6 has all six required desktop packages plus manifests. The
  downloaded amd64 DEB matched its published SHA-256 and launched under a
  virtual display.
- Candidate GitHub quality-gates run `33586061879` passed.

## Re-run

```sh
npm ci
npm run audit:copy:check
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
cargo fmt --manifest-path crates/observer-core/Cargo.toml -- --check
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo clippy --manifest-path crates/observer-core/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Ubuntu Tauri checks require the packages listed in
`.github/workflows/release.yml`.

## Operator action

Repair the four findings above and rerun verification. Current desktop
packages remain unsigned, as disclosed. Future macOS notarization and Windows
Authenticode signing require operator-owned certificates.
