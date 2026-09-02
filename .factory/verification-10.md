# Independent product verification 10 — FAIL

- Date: 2026-09-02 UTC
- Work order: `local-sync-observer-verify-10`
- Candidate: `a83cfb8a6bcf126bdd66b2ef443106f52c061786`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Result: **FAIL — do not release this candidate as the downloadable desktop app**

## Release-blocking finding

### High — desktop release is not built from the candidate

The live website is the candidate, but its live download controls resolve the
GitHub `latest` release, `v0.1.7`. GitHub's release API and its shipped
`latest.json` both identify that release as source commit
`3782d78e04858fdc566f33665452f1a45025f4e8`, not the verified candidate
`a83cfb8a6bcf126bdd66b2ef443106f52c061786`.

This is material: the release commit is behind the candidate by five commits,
including `416bc59 fix: close round five navigation and mobile regressions`.
The live site is therefore advertising an older desktop application under the
same `v0.1.7` version, rather than a package tied to the candidate. The release
manifest's explicit `sourceCommit` field makes the mismatch independently
observable. Publish a new version/tag from `a83cfb8…`, let the release workflow
produce all platform assets and a new `latest.json`/`SHA256SUMS`, then deploy
the matching site before re-verification.

The existing release itself is structurally complete and its integrity record
is sound: it contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB,
`SHA256SUMS`, and `latest.json`; a fresh download of
`Local.Sync.Observer_0.1.7_amd64.deb` matched its published SHA-256
`ccaf43d9de3c65fd6045569207cdc3ea6f4ff8e788e00ebc7dec95b9e6168d85`.
That does not cure its source-identity mismatch.

## Mandatory first-read and demo gate — PASS

Cold live landing-page reading:

- It does: **“Check what synced after offline work.”**
- It is for: people using Syncthing or Nextcloud who need pending work,
  conflicts, and connection status in one place.
- First action: **“Try it with sample data”**; the adjacent sentence says it
  opens a sample conflict board and saves nothing.

The action and direct `/?demo=1` both reach `/demo/?demo=1`. The page shows a
real mixed-provider conflict/pending board, persistent sample-data notice, and
Reset demo action. Fresh demo traffic stayed same-origin and had no cookies.

## Claims gate — PASS (26/26)

`.factory/claims.json` exists with 26 claims. From the clean candidate checkout
after `npm ci`, every registered claim test was exercised through the product's
demo/test entry points. The shared commands produced these complete results:

- `npm run test:e2e -- --grep @claim`: 32 browser-project runs passed.
- `npm test -- --testNamePattern @claim`: 4 registered Vitest claim tests
  passed.
- `cargo test --manifest-path crates/observer-core/Cargo.toml claim_`: 8 Rust
  claim tests passed.
- The registered `npm run test:claim:local-endpoint` command also passed: its
  Cargo test passed and both desktop/mobile browser projects passed.

This covers all listed IDs, including offline demo reload, local-only endpoint
validation, metadata-only scanning, GET-only provider checks, release fallback,
storage isolation, tray redaction, and Syncthing/Nextcloud status evidence.
No claim test failed.

## Local quality gates — PASS

| Check | Evidence |
| --- | --- |
| Candidate identity | Checkout began clean at `a83cfb8a6bcf126bdd66b2ef443106f52c061786`. |
| Install | `npm ci`: 67 packages installed, 0 vulnerabilities reported. |
| Type/unit/build | `npm run check` passed: TypeScript, 15/15 Vitest tests, `dist/app`, and `dist/site`. |
| Core integration | `cargo test --manifest-path crates/observer-core/Cargo.toml`: 9/9 passed. |
| Browser suite | `npm run test:e2e`: 58/58 passed. |
| Output budgets | Site JS 4,520 bytes total, CSS 12,555 bytes, and LCP hero WebP 82,064 bytes uncompressed; all below applicable budgets. |

## Independent product exercise — PASS

The full browser suite and claim suite exercised the useful flow and recovery
paths from clean state: no source causes no probe; a remote Syncthing host is
rejected; `[::1]` is accepted; Save and inspect performs the first probe; the
sample conflict remains while its owning sync tool is opened; refresh occurs at
30 seconds; source removal clears saved state; Nextcloud pending activity and
missing counts remain explicit. Rust integration tests covered normal,
conflict, offline, incomplete-evidence, scan-boundary, and non-destructive
paths against controlled fixtures.

## Live deployment, privacy, accessibility, and resilience — PASS

- The live `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; an unknown
  route returns 404.
- Live `/`, `/demo/`, and `/assets/home-Cw3ev4_C.js` SHA-256 values exactly
  match the candidate's production output. The live deployment is therefore
  the candidate website.
- `verify-url.sh` passed: HTTP 200, 851 ms load, correct title and `lang`, one
  H1, main landmark, no missing image alt, no unlabeled button, and no console
  errors.
- Fresh Playwright request logging found landing requests only to the product
  origin and the disclosed `https://api.github.com`; demo requests were only
  same-origin. Neither context had cookies. No console or page errors occurred.
- Live response headers include HSTS, `nosniff`, strict referrer policy,
  restrictive permissions policy, and a response-header CSP limited to self
  plus the disclosed GitHub API. Root HTML is `no-cache`; hashed JS is
  `public, max-age=31536000, immutable`.
- Desktop and 390 px mobile checks had no horizontal overflow. Pixel 5 used no
  GitHub API request, hid the desktop download, and showed the desktop-only
  handoff. The designed focus indicator is a 4 px blue outline. Reduced-motion
  emulation reduced transitions/animations to 0.00001 s.
- Fresh live axe scans at desktop and 390 px found zero serious or critical
  violations. The full suite also covers keyboard-only dialogs, focus, 200%
  reflow, offline reload, and service-worker behavior.

This static product has no first-party server-side API or product-unlock
endpoint, so a 429/`Retry-After` allowance test is not applicable. It has no
sign-in, so Entra authority validation is not applicable.

## Final verdict

**FAIL.** The candidate website is healthy, but the public desktop artifacts
are provably built from `3782d78…`, not candidate `a83cfb8…`. Release a new
candidate-identified desktop package set before accepting this work order.
