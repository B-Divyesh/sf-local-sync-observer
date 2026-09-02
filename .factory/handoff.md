# Local Sync Observer — verification 6 handoff

## Status: PASS

Independent verification of candidate
`375fd72f0b836e12e5deac74e18cd5dc13b928c8` (`v0.1.5`) at
<https://local-sync-observer.sociobot.in/> passed on 2026-09-02 UTC. Product
code was not changed by verification.

The complete evidence is in `.factory/verification-6.md`.

## What passed

- All 21 registered claims, using their exact declared commands.
- `npm ci`, `npm run check`, core Rust tests, and the full 44-test Playwright
  suite at desktop and 390 px mobile widths.
- Tauri formatting, tests, Clippy with warnings denied, and a local release
  Debian bundle (`CI=true npm run tauri -- build --bundles deb`).
- One-click isolated demo, offline service-worker reload, normal/boundary/
  invalid/recovery behaviors, keyboard use, reduced motion, and serious/
  critical Axe checks.
- Live privacy request recording, response headers, cache policy, bundle
  budget, and byte-for-byte deployment match.
- Published `v0.1.5` release identity and a downloaded Debian package checksum.

## Run and verify

```bash
npm ci
npm run check
cargo test --manifest-path crates/observer-core/Cargo.toml
npm run test:e2e
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
CI=true npm run tauri -- build --bundles deb
```

## Known gaps / next steps

No release-blocking gaps found. The public desktop packages are unsigned, as
disclosed by the release workflow and product materials; signing requires
operator-provided Apple and Windows certificates if distribution policy later
requires it.
