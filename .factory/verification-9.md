# Independent product verification 9 — PASS

- Date: 2026-09-02 UTC
- Work order: `local-sync-observer-verify-9`
- Candidate: `a525ced8fb0f69908fd824d62804acfb41a3ff3b`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Result: **PASS — candidate accepted**

## Decision

The candidate satisfies the researched brief and factory acceptance contract.
The one-click demo, read-only observer flow, privacy boundary, accessibility,
offline behavior, release packages, and live deployment all passed fresh
verification. No critical, high, medium, or low product defects were found.

The public desktop packages are intentionally unsigned. That is disclosed and
is the only remaining operator action; it is not a defect under the installer
contract.

## Mandatory first-read and demo gate — PASS

A cold 1440 x 900 visit returned HTTP 200 with no console or page errors. The
first screen answers the required questions in plain words:

- What: **“Check what synced after offline work.”**
- For whom: people using Syncthing or Nextcloud who need pending work,
  conflicts, and connection status in one place.
- First action: **“Try it with sample data”**, immediately followed by
  “Opens a sample conflict board; nothing is saved.”

One click opened `/demo/?demo=1` and immediately showed a Syncthing conflict
and Nextcloud pending activity. The persistent demo banner says sample data is
not saved and offers **Reset demo** and the real-product exit
**Choose a download**. Direct `/?demo=1` also reached the working demo.

## Claims gate — PASS (26/26)

`.factory/claims.json` exists and contains 26 entries. After the clean-clone
`npm ci`, every registered command was run separately and exactly as written,
in file order. All passed. Temporary command logs were captured under
`/tmp/lso-verify-claims/` during the run.

| Claim | Result | Fresh evidence |
| --- | --- | --- |
| `release-downloads` | PASS | Registered Playwright command: 1 desktop pass; mobile intentionally covered by its own claim. |
| `release-matrix` | PASS | Registered Vitest command: 1 pass. |
| `checksum-install` | PASS | Registered Vitest command: 1 pass, including bad-hash rejection and exact-byte install. |
| `evidence-boundary` | PASS | Registered Vitest command: 1 pass. |
| `metadata-only-scan` | PASS | Registered Cargo command: 1 pass. |
| `scan-bounds` | PASS | Registered Cargo command: 1 pass. |
| `local-endpoint-only` | PASS | Registered combined Cargo/Playwright command: core pass and 2 browser-project passes, including `[::1]`. |
| `mobile-desktop-handoff` | PASS | Registered Playwright command: 2 passes; fresh live Android and iPhone sessions also hid the download and made zero GitHub API calls. |
| `local-app-storage` | PASS | Registered Playwright command: 2 passes. |
| `open-owner` | PASS | Registered Playwright command: 2 passes. |
| `thirty-second-refresh` | PASS | Registered Playwright command: 2 passes. |
| `site-private` | PASS | Registered Playwright command: 2 passes. |
| `mit-license` | PASS | Registered Vitest command: 1 pass. |
| `isolated-demo` | PASS | Registered Playwright command: 2 passes. |
| `demo-private` | PASS | Registered Playwright command: 2 passes. |
| `offline-demo-reload` | PASS | Registered Playwright command: 2 passes. |
| `release-fallback` | PASS | Registered Playwright command: 1 desktop pass; mobile intentionally covered by the handoff claim. |
| `syncthing-reading` | PASS | Registered Cargo command: 1 pass against a controlled loopback server. |
| `reading-details` | PASS | Registered Cargo command: 1 pass. |
| `read-only-probe` | PASS | Registered Cargo command: 1 pass, including GET-only requests and byte-identical fixtures. |
| `tray-status` | PASS | Registered Playwright command: 2 passes. |
| `no-product-account` | PASS | Registered Playwright command: 2 passes. |
| `release-cache-retention` | PASS | Registered Playwright command: 1 desktop pass; mobile does not request release metadata. |
| `nextcloud-desktop-log` | PASS | Registered Cargo command: 1 pass across conflict, offline, pending, and complete fixtures. |
| `mixed-provider-demo` | PASS | Registered Playwright command: 2 passes. |
| `checks-require-source` | PASS | Registered Playwright command: 2 passes; zero probes occurred before save. |

Landing, demo, legal, app, and README copy were cross-checked against the
registry. No contradictory or material unlisted product claim was found.

## Independent end-to-end exercise

The production desktop UI was served from the exact candidate build with an
instrumented native boundary and fresh storage:

1. The honest empty state showed **No sources added** and made no provider
   probe.
2. `https://sync.example.com` was rejected with the local-only explanation;
   the setup dialog remained open and probe count stayed zero.
3. Replacing it with `http://[::1]:8384` and selecting **Save and inspect**
   made one production `probe_syncthing` invocation and displayed
   **1 conflict file needs attention**.
4. **Refresh status** made the second probe and recovered the same source to
   **Every reported folder has zero pending items**.
5. Removing the source restored the empty state and left an empty saved source
   list. The tested state had no console/page errors and no serious or critical
   Axe findings.

The complete core integration suite independently covered controlled
Syncthing responses, conflict priority, offline devices, incomplete evidence,
metadata-only scans, the 50,000-entry/depth-16 bounds, GET-only behavior,
Nextcloud log states, and tray redaction. All 9 tests passed.

## Local quality gates

| Gate | Result |
| --- | --- |
| Clean identity | PASS — checkout began clean at the exact candidate SHA. |
| `npm ci` | PASS — 67 packages, 0 reported vulnerabilities. |
| `npm run audit:copy:check` | PASS. |
| `npm run check` | PASS — TypeScript, 14/14 Vitest tests, and exact app/site production builds. |
| `npm run test:e2e` | PASS — 53 passed, 3 intentional mobile-release skips. |
| Observer core format/test/clippy | PASS — 9/9 tests; strict Clippy produced no warnings. |
| Tauri format/test/clippy | PASS after installing the workflow-declared Linux WebKit/GTK prerequisites. |
| Candidate GitHub Actions | PASS — run `33591833845`; Rust, Ubuntu web, and Windows web jobs succeeded. |

The exact build produced `dist/app` and `dist/site`. Uncompressed production
budgets were app JS 23,700 bytes, app CSS 11,786 bytes, site JS 3,645 bytes,
site CSS 12,555 bytes, and hero WebP 82,064 bytes. All are comfortably within
the contract budgets.

## Live accessibility, privacy, resilience, and performance

- The factory `verify-url.sh` passed: HTTP 200, 901 ms load, correct title,
  `lang=en`, one H1, one main landmark, zero missing image alt attributes, zero
  unlabeled buttons, and no browser errors.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed unknown route were
  checked at 1440 x 900 and 390 x 844. All had route-specific titles, one H1,
  one main landmark, no overflow, no undersized visible controls, and zero
  serious/critical Axe findings. The unknown route correctly returned HTTP
  404; Chromium's failed-document console line is the expected status report,
  not an application exception.
- At the equivalent 200% reflow width (195 CSS px), all four public routes had
  `scrollWidth === clientWidth` and no clipped controls.
- Keyboard smoke testing found a designed 4 px blue focus indicator. Initial
  route focus lands on the H1, then Tab reaches the primary demo action and all
  subsequent controls without a trap. Dialog focus and Escape behavior also
  passed in the full Playwright suite.
- Reduced-motion emulation matched and left no active animations or
  transitions; root scroll behavior was `auto`.
- The fresh landing request log used only the product origin and the disclosed
  GitHub release API. It set no cookies. The demo used only the product origin,
  kept `demo:local-sync-observer.site.v1` separate from a real-data sentinel,
  reset correctly, and deleted only the demo key when leaving.
- The service worker activated, `registration.update()` completed, and an
  offline reload returned the demo with the conflict still visible and no page
  errors.
- Home responses use `no-cache`; the service worker uses `no-cache`; hashed JS,
  CSS, and image responses use `public, max-age=31536000, immutable`.
- Security headers include HSTS, `nosniff`, strict referrer policy, a restrictive
  permissions policy, and a CSP limited to self plus the disclosed GitHub API;
  `frame-ancestors 'none'` is delivered as a response header.
- Every unique site link returned HTTP 200 after redirects. Android and iPhone
  user agents saw the desktop-only handoff, no primary package action, and zero
  GitHub API requests.
- Fresh Lighthouse 13.0.1 mobile scores were Performance 100, Accessibility
  100, Best Practices 100, and SEO 100. FCP was 1.1 s, LCP 1.2 s, TBT 20 ms,
  CLS 0.025, and total transfer 180 KiB.

## Deployment and release identity

All 23 deployable candidate files other than deployment configuration matched
the live responses byte-for-byte by SHA-256. This includes every HTML route,
hashed JS/CSS, service worker, installers, metadata, and image asset. The live
deployment therefore matches the candidate.

The public non-draft `v0.1.7` release resolves to
`3782d78e04858fdc566f33665452f1a45025f4e8`, an ancestor of the candidate.
The only candidate change since that tag is `.factory/handoff.md`; there is no
product-source or deployable-file difference. Release workflow run
`33591307004` passed both macOS architectures, Windows x64, Linux x64, and
finalization.

`latest.json` identifies the same tagged commit for all six packages and
contains the required four platform entries. A fresh download of
`Local.Sync.Observer_0.1.7_amd64.deb` matched `SHA256SUMS`; its SHA-256 is
`ccaf43d9de3c65fd6045569207cdc3ea6f4ff8e788e00ebc7dec95b9e6168d85`.
Package metadata is `local-sync-observer` 0.1.7 amd64. The extracted executable
remained running for the full eight-second Xvfb smoke window and was terminated
by the harness timeout; only expected headless portal/session warnings appeared.

This is a static site plus local desktop application. It exposes no first-party
server or product-unlock endpoint, so the 429/`Retry-After` check is not
applicable. It has no sign-in, so Entra authority validation is not applicable.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Final verdict

**PASS.** Candidate `a525ced8fb0f69908fd824d62804acfb41a3ff3b` is suitable for release at
<https://local-sync-observer.sociobot.in/>.
