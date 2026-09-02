# Verification 7 — PASS

Candidate: `2c429b40441b7108e715586a56a7c93d87c17de9`  
Live URL: <https://local-sync-observer.sociobot.in/>  
Verified: 2026-09-02 UTC

## Decision

**PASS.** Fresh local and production evidence shows that the published static
site is the candidate's build and that the desktop product's read-only,
local-first job is covered by its tested core and published release.

## Cold first read

A new browser session says: **“Check what synced after offline work.”** It
then says it is for people using Syncthing or Nextcloud who need pending work,
conflicts, and connection status in one place. The first primary action is
**“Try it with sample data”**, with the adjacent explanation “Opens a sample
conflict board; nothing is saved.” One click opens `/demo/?demo=1`, immediately
showing the Field notes conflict and Nextcloud pending reading. The persistent
banner identifies it as sample data and offers **Reset demo** and an exit to
real downloads. This satisfies the plain-words and one-click-demo gate.

## Clean-checkout quality gates

`npm ci` installed 67 packages with zero reported vulnerabilities. All 23
exact commands declared in `.factory/claims.json` passed from the demo entry
point:

| Claim groups | Result |
| --- | --- |
| Playwright: release downloads, local storage, open owner, refresh, site privacy, isolated demo, demo privacy/offline reload, release fallback/cache, tray status, no account | Pass on desktop and mobile projects |
| Vitest: release matrix, checksum installer, evidence boundary, MIT license | Pass |
| Rust: metadata-only scan, bounds, local endpoint, Syncthing state/details/read-only behavior, Nextcloud log | Pass |

Additional results:

- `npm run check`: pass — TypeScript, 14/14 Vitest tests, and exact production
  `dist/app` and `dist/site` builds.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: pass — 9/9.
- `npm run test:e2e`: pass — 48/48 desktop/mobile tests;
  `test-results/.last-run.json` records `passed` with no failed tests.
- Production budget: app initial JavaScript 7.88 KB gzip; landing JavaScript
  1.15 KB gzip and CSS 3.21 KB gzip.
- `cargo check --manifest-path src-tauri/Cargo.toml` could not run in this
  disposable Linux image because `glib-2.0.pc` is absent. This is an image
  dependency, not a source diagnostic; the published cross-platform release
  exists and the product's core Rust tests pass. No source defect was inferred.

## Live behavior, privacy, accessibility, and delivery

- Live `/` and local `dist/site/index.html` have the same SHA-256
  (`4ee46b…269832`); the served `home-_Dgk5D7b.js` also exactly matches local
  output (`c28056…f515fb`). The candidate differs from the `v0.1.6` tag only
  in subsequent factory documentation, not shipped product files.
- Cold live `/` made requests only to the product origin and the disclosed
  GitHub release API; it set no cookies and produced no console or page errors.
  A fresh `/demo/?demo=1` visit made requests only to the product origin.
- At 1440 px and 390 px, the one-click demo worked without horizontal overflow.
  Keyboard focus was visible (`rgb(6, 69, 209) solid 4px`). Axe Core reported
  zero serious or critical findings. With reduced motion, demo transition
  duration was `0.00001s`.
- After the first demo visit, a service-worker-controlled offline reload still
  showed the conflict. Live routes `/`, `/demo/`, `/privacy/`, `/terms/`,
  `/404.html`, `robots.txt`, and `sitemap.xml` returned 200; an unknown route
  returned 404.
- Live HTML sends HSTS, CSP (`connect-src 'self' https://api.github.com`),
  `frame-ancestors 'none'`, `nosniff`, referrer and permissions policies.
  A hashed JavaScript asset is immutable for one year.

The latest public release is `v0.1.6`. Its manifest verifies six artifacts
against source commit `975d41d47926f5981af923e47cf82d32aca7074e`, the tagged
product source ancestor of this documentation-only candidate. It includes both
macOS DMGs, Windows MSI/EXE, and Linux AppImage/DEB. Downloaded Linux DEB
SHA-256 is `10f562814591ad9bc8214c164cd9114eff6532c3f82fd0711adca7efa440afe4`,
matching `latest.json`; package identity is `local-sync-observer 0.1.6 amd64`.

There is no product server endpoint or sign-in flow, so API rate-limit and
Entra tenant checks do not apply.

## Defects

No release-blocking product defects found. The only incomplete local check was
the native Tauri `cargo check` noted above, blocked by a missing host GTK/GLib
development dependency in the verifier image.
