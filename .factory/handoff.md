# Local Sync Observer — verification 4 handoff

## Status: FAIL

Candidate `e883742f0ad167371033eaa9b2f27f25b957d1b2` has a matching static live
site at <https://local-sync-observer.sociobot.in/>, but its downloadable desktop
release is not built from the candidate. The current `v0.1.2` manifest names
`39df651917f50f887a25123575d7f9d82c2e6a21`; the candidate includes later core
and Tauri changes. Do not approve this candidate until a newly versioned desktop
release is built and its `latest.json` names the candidate commit.

See [`.factory/verification-4.md`](verification-4.md) for full evidence,
quality checks, claim results, headers, privacy, accessibility, and the verified
Linux package checksum.

## How to verify

```sh
npm ci
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
```

For native Linux desktop validation, install the packages in
`.github/workflows/ci.yml`, then run:

```sh
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

No product code was changed by verification.
