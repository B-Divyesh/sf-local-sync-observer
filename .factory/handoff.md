# Local Sync Observer — verification 10 handoff: **FAIL**

## Current release decision

Candidate `a83cfb8a6bcf126bdd66b2ef443106f52c061786` **FAILS independent
verification**. The live website at
<https://local-sync-observer.sociobot.in/> matches the candidate byte-for-byte,
and all local/live functional, privacy, accessibility, claim, and build checks
pass. However, its download controls lead to release `v0.1.7`, whose GitHub API
record and shipped `latest.json` identify source commit
`3782d78e04858fdc566f33665452f1a45025f4e8`, not this candidate.

This is a high-severity release-identity defect. The release is five commits
behind and omits candidate-era product fixes. Publish a new version/tag from
`a83cfb8…`, let the release workflow create all platform artifacts,
`SHA256SUMS`, and `latest.json`, then deploy the corresponding site and repeat
verification. See `.factory/verification-10.md` for exact fresh evidence.

# Local Sync Observer — polish round 5 handoff (superseded by verification 10)

## Outcome

Round 5 is complete. The repair removes the duplicated phone handoff, makes
the copy audit unique, and restores each page's scroll position on Back and
Forward while preserving route-heading focus.

- Product repair commit: `416bc59486cf37bf68974f064772d067cc171620`
- Deployment: `53aa5c31-3a5b-4f31-9b04-89894bece59b`
- Live site: <https://local-sync-observer.sociobot.in/>
- Demo: <https://local-sync-observer.sociobot.in/?demo=1>
- Desktop release: [v0.1.7 on GitHub](https://github.com/B-Divyesh/sf-local-sync-observer/releases/tag/v0.1.7)

## What changed

- Android and iPhone visitors now see one desktop handoff sentence. The
  release note and unusable download action are hidden on phones.
- The mobile claim uses Pixel 5 and iPhone 13 profiles at 390 × 844 and checks
  that all three first-screen facts fit within `window.innerHeight`.
- The copy generator segments runtime strings before deduplication. Its
  regression rejects duplicate or merged handoff sentences.
- Route history entries preserve their own scroll coordinates. New pages
  focus the h1, while Back and Forward restore both focus and scroll after
  asynchronous download copy settles.
- The catalog description is now: “Check Syncthing and Nextcloud sync status
  after offline work without opening files.” It is verb-first and 83
  characters.

## Verification

- Clean-clone claims: all 26 exact commands passed after
  `npm ci --include=dev`; see
  `.factory/polish-5-evidence/clean-claims-summary.txt`.
- Web checks: `npm run audit:copy:check`, `npm run check`, and
  `npm run test:e2e` pass. Results are 15 Vitest checks and 54 executed
  Playwright checks, with 4 intentional platform skips.
- Native checks: `observer-core` passes 9 tests and strict clippy. The Tauri
  crate passes formatting, test compilation, and strict clippy after the
  workflow-declared Linux packages are installed.
- Live structure: home, demo, Privacy, Terms, and 404 each have their required
  title, metadata, one h1, one main, focused heading, and no horizontal
  overflow. Axe found zero serious or critical issues on all five routes.
- Live mobile: both phone profiles place the final fact at 755.02 px in an
  844 px viewport. Screenshots are
  `.factory/polish-5-evidence/live-home-pixel5.png` and
  `.factory/polish-5-evidence/live-home-iphone13.png`.
- Live history: the checked route sequence restored scroll as
  `1000 → 0 → 1000 → 0`, with the correct h1 focused at every step.
- Live demo: the direct URL, banner, mixed-provider sample, reset, namespace
  isolation, exit cleanup, same-origin request boundary, and offline reload
  pass. See `.factory/polish-5-evidence/live-demo-mobile.png` and
  `.factory/polish-5-evidence/live-check.json`.
- Live delivery: `verify-url.sh` passes with no home-page console error; every
  one of 23 deployed files matches the local build by SHA-256; all nine unique
  links return 200.
- Lighthouse 13.4.1 mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. LCP is 1.2 s, TBT 70 ms, CLS 0.003, and initial
  transfer is 181 KiB.
- GitHub quality-gates run
  [33598894760](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33598894760)
  passed.
- Release `v0.1.7` has macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB,
  `SHA256SUMS`, and `latest.json`. A fresh Debian download passed SHA-256 and
  package identity checks.

## Run locally

```sh
npm ci --include=dev
npm run audit:copy:check
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
```

For native Tauri checks on Ubuntu, first install the packages listed in
`.github/workflows/ci.yml`, then run:

```sh
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Known gaps and operator action

No review finding or functional repair remains open. The v0.1.7 desktop
packages are unsigned. Production signing needs the owner's
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; those credentials were not
available or required for this static-site repair.
