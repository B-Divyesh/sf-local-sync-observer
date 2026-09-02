# Local Sync Observer — repair 5 handoff

## Outcome

The release-identity blocker from independent verification 10 is repaired in
v0.1.8. The website now offers a desktop download only when GitHub's latest
release has both the current version and the website's exact source commit.
An older release produces the calm publishing fallback and no direct download
link.

The desktop release remains a Tauri 2 app. The website remains a static Azure
Static Web Apps deployment at <https://local-sync-observer.sociobot.in/>.

## Root cause and repair

Release v0.1.7 came from `3782d78e04858fdc566f33665452f1a45025f4e8`.
The verified website candidate was
`a83cfb8a6bcf126bdd66b2ef443106f52c061786`. The landing page trusted the
latest GitHub release asset list without comparing that release to its own
build.

The repair:

- bumps every package and visible build reference to v0.1.8;
- embeds the full Git source commit into the production website build;
- requires the GitHub release tag and `target_commitish` to match the website
  version and source commit before exposing any artifact URL;
- discards a cached release if its identity does not match the current site;
- removes the primary download and changes platform links to the release index
  when identity is missing, stale, or unavailable;
- retains the release workflow's tag checkout, candidate check, manifest
  source identity, checksum generation, and final identity verification;
- updates the `release-downloads` claim and tests the verifier's exact stale
  commit against the original candidate commit;
- recaptures the three 900 x 600 walkthrough frames from the v0.1.8 desktop UI.

## Local verification

The repair was checked from a clean `npm ci --include=dev` installation:

| Gate | Result |
| --- | --- |
| Clean install | 67 packages; 0 reported vulnerabilities |
| `npm run audit:copy:check` | Pass; all extracted sentences are at most 22 words and contain no banned term |
| `npm run check` | Pass; TypeScript, 15 Vitest checks, `dist/app`, and `dist/site` |
| `npm run test:e2e` | Pass; 54 checks, 4 intentional platform skips |
| `npm test -- --testNamePattern @claim` | Pass; 4 registered claim checks |
| `cargo test --manifest-path crates/observer-core/Cargo.toml claim_` | Pass; 8 registered claim checks |
| `npm run test:claim:local-endpoint` | Pass; 1 Rust and 2 browser checks |
| `npm run test:e2e -- --grep @claim` | Pass; 29 checks, 3 intentional mobile skips |
| Core Rust test and strict Clippy | Pass; 9 tests |
| Tauri Rust test compilation and strict Clippy | Pass |
| Local `verify-url.sh` | Pass; title, `lang`, one h1, main, alt text, labels, and zero console errors |
| Lighthouse 13.0.1 mobile | 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO |
| Lighthouse metrics | LCP 1.8 s, TBT 0 ms, CLS 0.003, 182 KiB transfer |
| Production site budget | 5,041 bytes JS, 12,555 bytes CSS, 82,064-byte hero WebP |

The browser suite covers desktop and 390 x 844 mobile layouts, keyboard
dialogs, route focus and history, 200% reflow, touch targets, Axe, privacy,
demo isolation, offline reload, service-worker behavior, release fallback, and
the release-source mismatch regression. Evidence is under
`.factory/repair-5-evidence/`.

## Release and deployment evidence

- Release: `v0.1.8`, built by `.github/workflows/release.yml` from its tagged
  commit.
- Required release files: macOS arm64 and Intel DMGs, Windows MSI and EXE,
  Linux AppImage and DEB, `SHA256SUMS`, and `latest.json`.
- `latest.json` identifies the same commit as the peeled v0.1.8 tag and every
  artifact entry.
- A downloaded Linux Debian package matches its published SHA-256 value and
  reports package version 0.1.8.
- The production site was deployed from `dist/site` with the work order's
  static deployment configuration.
- Live `verify-url.sh`, desktop and 390 px browser checks, Axe, privacy request
  logging, offline demo reload, response headers, 404 behavior, and download
  identity checks pass.

## Run it

```sh
npm ci --include=dev
npm run audit:copy:check
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
```

For native checks on Ubuntu, install the packages in
`.github/workflows/ci.yml`, then run:

```sh
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Known gaps and operator action

No release-blocking product finding remains. Builds are unsigned. Production
signing still requires the owner's `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX` secrets; this repair does not have those certificates.
