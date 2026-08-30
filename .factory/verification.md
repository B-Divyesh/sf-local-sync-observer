# Independent product verification — FAIL

- Date: 2026-08-30 UTC
- Candidate: `1313d781ab40a7b3fe4c950a080a2163321ce925`
- Live URL: `https://local-sync-observer.sociobot.in`
- Work order: `local-sync-observer-verify-1`
- Result: **FAIL — release blocked**

## Mandatory acceptance gates

### Claims gate — FAIL

`.factory/claims.json` is absent. The first command in the clean clone returned:

```text
sed: can't read .factory/claims.json: No such file or directory
```

Therefore no claim tests exist or can be run through the product demo entry point. This is release-blocking under the supplied claims contract. The landing page and README make material claims including “Reads status, never file contents”, “No account or telemetry”, checksum verification, provider coverage, and local-only behavior; none is registered in a claims file.

### Cold first-read and demo gate — FAIL

Cold desktop load returned HTTP 200 with title `Local Sync Observer — know what actually synced` and H1 `Know what actually synced.` The first screen says the product shows pending files, conflict copies, and last-good state for “local-first stacks”. The intended audience is only implied through that jargon rather than named in plain words. The first action is `Download for Linux`.

There is no `Try it with sample data` action on the first screen. `/demo` returns the same landing HTML as `/`, and `.factory/demo.md` is absent. The desktop app has a later `Preview an example` button, but it is not a compliant sandbox: there is no persistent “Demo — sample data, nothing is saved” banner, no Reset demo action, and no separate storage namespace. In a clean browser-app run, sample storage was initially empty; selecting `Refresh evidence` after loading the sample wrote the sample into the real `local-sync-observer.v1` key and replaced its conflict reading with an offline result.

These conditions independently require a FAIL.

## End-to-end product result

The core native observer does work when installed. The published Linux AppImage was launched in an isolated XDG profile and connected to a local mock Syncthing API at `127.0.0.1:8384`:

1. A fixture named `notes.sync-conflict-20260830-060500-DEVICE.md` produced `1 conflict file need attention`, with pending `0`, conflicts `1`, and “File contents were not opened.”
2. Renaming the fixture to `notes.md` and selecting `Refresh evidence` recovered to `Converged`, pending `0`, conflicts `0`.
3. Reporting the configured peer as disconnected changed the result to `Offline` and explicitly said convergence was not confirmed.
4. An unavailable local endpoint produced an actionable error and recovered on refresh after the endpoint became available.
5. Remote `https://sync.example.com` input was rejected. Empty folder selection produced an inline error in the browser shell.

This validates the smallest useful detection path and conservative state handling, but does not override the release-blocking gates.

## Defects

### Critical / release-blocking

1. **Required claim registry and claim tests are missing.** `.factory/claims.json` does not exist. All public behavioral/privacy claims are unlisted and untested under the required sandbox protocol.
2. **Required one-click landing demo is missing.** The first screen offers downloads, not sample data. `/demo` is only the home-page fallback. `.factory/demo.md` is absent. The in-app example lacks the mandatory banner/reset/real-start controls and can write sample state into the production storage key.

### High

1. **Live download resolution always raises a browser CORS error.** Both desktop and mobile cold loads attempted `https://github.com/B-Divyesh/sf-local-sync-observer/releases/latest/download/latest.json`; GitHub returned no CORS permission. Playwright and Lighthouse recorded the blocked request plus `net::ERR_FAILED`. The primary and platform links therefore fall back to the generic release page rather than a detected, real asset. The repository E2E test masks this by intercepting and fulfilling that exact URL. This violates the installer contract and the no-console-error gate.
2. **The native source dialog exposes the inactive form.** In the released Linux AppImage at the default window size, selecting Syncthing still displays the disabled Folder metadata name/path/URL fields. Its `Choose…` button remains visible and operable and opened a native folder picker. The irrelevant controls force the first-run dialog to scroll and put `Save and inspect` below the initial viewport. The cause is observable in the shipped UI: `.form-fields { display: grid }` overrides the `hidden` state in WebKit.
3. **Both legal pages have an axe serious failure at 390 px.** `/privacy/` and `/terms/` fail `link-name`: the header home link has no accessible name after the visible product-name span is hidden at the mobile breakpoint. The existing legal-page E2E test checks only H1/overflow and misses axe.

### Medium

1. **Required site structure/security files are absent.** No `robots.txt`, `sitemap.xml`, `404.html`, or `staticwebapp.config.json` exists. Unknown paths return the home page with HTTP 200. Responses have HSTS, `nosniff`, and a referrer policy, but no Content-Security-Policy or `frame-ancestors`. The landing page also lacks the required canonical URL, OG image, Twitter card metadata, favicon/apple-touch icon, and footer build/version.
2. **Cache policy misses the immutable-asset requirement.** HTML, hashed JS/CSS, images, and `sw.js` all return `Cache-Control: public, must-revalidate, max-age=30`; hashed assets are not long-lived immutable.
3. **Several link targets are under 44 px.** At 390 px the brand target is 50×42; footer links are only 15–20 px high. Desktop has the same 42 px brand and short footer targets.
4. **The landing brand has a label/name mismatch at mobile size.** Lighthouse flags the visible `LS/O` text as absent from the accessible name `Local Sync Observer home`.
5. **Required factory audits are absent.** `.factory/copy-audit.md` is missing alongside the demo and claims documents.

## Verification matrix

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`; 67 packages, 0 vulnerabilities |
| Unit tests | PASS | `npm test`; 4/4 |
| Type/build aggregate | PASS | `npm run check` |
| Exact production build | PASS | `npm run build`; `dist/app` and `dist/site` produced |
| Playwright suite | PASS | clean rerun: 12/12 desktop/mobile tests |
| Rust formatting | PASS | `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` |
| Rust tests | PASS | 3/3 after installing the CI-declared Linux WebKit dependencies |
| Rust lint | PASS | `cargo clippy --all-targets -- -D warnings` |
| Native packaged launch | PASS | AppImage remained healthy until the 8-second harness timeout |
| Real native conflict/recovery flow | PASS | conflict → converged → offline states observed against local fixtures |
| Landing axe | PASS | no serious/critical findings at 1440 px or 390 px |
| App axe | PASS | no serious/critical findings in empty and sample states at both widths |
| Legal-page axe | FAIL | `link-name` serious on both pages at 390 px |
| Keyboard/focus | PASS with touch-size defects | skip link and actions tab in order with a 4 px visible focus outline; dialog focuses first field and Escape closes it |
| Reduced motion | PASS | smooth scrolling disabled; transitions/animations reduced to 0.01 ms and one iteration |
| Mobile overflow | PASS | no horizontal document overflow on landing, legal pages, or app at 390 px |
| Offline reload/SW update | PASS | active `/sw.js`; update completed; `/` and `/privacy/` reloaded offline |
| Live console/page errors | FAIL | two console errors from the release-manifest CORS failure; no uncaught page exception |
| Privacy request log | PASS with disclosed GitHub request | same-origin HTML/JS/CSS/image/legal requests plus the failed GitHub manifest request; no analytics hosts |
| Browser storage/cookies on landing | PASS | no cookies, localStorage, or sessionStorage entries |
| Headers | FAIL | no CSP/frame restriction; short cache policy on hashed assets |
| Rate limiting | N/A | product exposes no server-side API or unlock endpoint |
| Authentication | N/A | no sign-in |
| Lighthouse mobile | PASS for stated thresholds | Performance 93, Accessibility 100, Best Practices 96, SEO 100; LCP 2.3 s, CLS 0.004, total transfer 87 KiB. TBT was 250 ms; field INP is unavailable in a lab cold load. |
| Bundle budgets | PASS | landing JS 2.10 KB, CSS 9.05 KB, hero WebP 82.06 KB; app JS 19.21 KB total, app CSS 10.67 KB (uncompressed) |
| Release assets | PASS | v0.1.0 includes arm64/x64 DMGs, MSI/EXE, AppImage/DEB, `latest.json`, and `SHA256SUMS` |
| Linux checksum | PASS | downloaded AppImage SHA-256 `cc00e3ad7826715698bf9a7462bed23b37937fe3bf8d0375c2c84a5f0d9755b8`, matching manifest and `SHA256SUMS` |

## Deployment identity

The live `index.html`, hashed JS, hashed CSS, service worker, privacy page, terms page, shell installer, PowerShell installer, and WebP hero all match the locally built candidate byte-for-byte by SHA-256. The deployed static site therefore matches candidate `1313d78`.

Release tag `v0.1.0` resolves to `b66485848b06016e5f1799bfbe68fbf0898e31ec`, the candidate’s immediate parent. The only candidate delta is `.factory/handoff.md`; executable and site sources are unchanged. The published binaries are thus source-equivalent but are not literally tagged at the candidate SHA.

## Privacy and network evidence

- The landing page loaded only self-hosted assets plus the disclosed GitHub release-manifest request; no cookies or storage were created.
- Source audit found no analytics, telemetry, CDN fonts/scripts, or external model calls.
- Native Syncthing traffic was confined to the user-selected loopback endpoint in the end-to-end run.
- The Rust integration rejects non-loopback/non-`.local` endpoints and uses GET requests. Folder traversal does not open file contents.
- API keys are stored unencrypted in WebView local storage, which the README and privacy page disclose.

## Final decision

**FAIL. Do not release this candidate.** The product’s core native job is useful and functional, but the missing claims registry, missing compliant one-click demo, live CORS/console failure, native setup-dialog state bug, and mobile legal accessibility failures violate explicit acceptance conditions.
