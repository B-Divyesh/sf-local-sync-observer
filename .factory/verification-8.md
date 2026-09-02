# Independent product verification 8 — FAIL

- Date: 2026-09-02 UTC
- Work order: `local-sync-observer-verify-8`
- Candidate: `2d4d8383cb2de8a96ff3a42e82938db10dd0509b`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Result: **FAIL — do not release this candidate**

## Decision

The product's main flow, demo, privacy boundary, release artifacts, build, and
automated suites work. The candidate still fails the acceptance contract:

1. The live mobile download detector labels Android and iOS as Linux and sends
   both to the x86_64 AppImage. That is not an installable build for either
   device.
2. The registered `local-endpoint-only` claim is false at the desktop UI
   boundary. The Rust core accepts IPv6 loopback, but the form rejects
   `http://[::1]:8384` before invoking the provider probe.
3. The desktop UI has one 48 x 40 px home target at 390 px and horizontally
   clips controls when text is evaluated at the required 200% reflow size.

The first two are release-blocking product/claim defects. No product code was
changed during this verification.

## Mandatory first-read and demo gate — PASS

A cold, fresh 1440 x 900 visit returned HTTP 200 with no console or page
errors. Its first screen answers all three required questions:

- What: **“Check what synced after offline work.”**
- For whom: people using Syncthing or Nextcloud who need pending work,
  conflicts, and connection status in one place.
- First action: **“Try it with sample data”**, followed by “Opens a sample
  conflict board; nothing is saved.”

One click opened `/demo/?demo=1`. The first demo view already showed a
Syncthing conflict and Nextcloud pending activity. Its persistent banner
offered **Reset demo** and **Choose a download**.

## Claims gate

`.factory/claims.json` exists and contains 25 complete entries. The mandatory
raw pre-install invocation found the expected clean-clone prerequisite state:
the seven Cargo claims passed while the 18 Node commands could not resolve
local `vitest`/`@playwright/test` before dependencies were installed. After
`npm ci`, all 25 exact commands were rerun separately in registry order and
passed: **25 passed, 0 failed**. Logs were retained during the run under
`/tmp/lso-claim-logs/`.

The independent boundary test nevertheless disproves the wording of one
registered claim:

| Claim | Declared test | Declared result | Independent result |
| --- | --- | --- | --- |
| `local-endpoint-only` — “accept loopback or .local endpoints” | core Cargo test using `127.0.0.1` | PASS | **FAIL:** desktop form rejects IPv6 loopback `http://[::1]:8384`; zero provider calls |
| Other 24 claims | exact commands in `.factory/claims.json` | PASS | No contradiction found |

The gap exists because the Rust validator removes IPv6 brackets, while
`new URL(value).hostname` in `src/main.ts` yields `[::1]` and is compared with
the unbracketed string `::1`. The claim test covers only IPv4 loopback.

The landing page, legal copy, app copy, and README were cross-checked against
the registry. No other material unlisted claim was found.

## Release-blocking findings

### High — mobile OS detection offers an unusable download

Fresh Playwright device contexts against the live URL produced:

| Device | Reported platform | Live primary action | Live target |
| --- | --- | --- | --- |
| Pixel 5 | `Android` | Download for Linux from GitHub | `Local.Sync.Observer_0.1.6_amd64.AppImage` |
| iPhone 13 | `iOS` | Download for Linux from GitHub | `Local.Sync.Observer_0.1.6_amd64.AppImage` |

`detectPlatform()` defaults every non-Windows/non-macOS visitor to
`linux-x64`. The 390 px first screen therefore gives phone users a prominent
download that cannot run on their device. The installer contract requires a
truthful detected-platform path; unsupported mobile visitors need a clear
desktop-only message instead.

### High — IPv6 loopback is rejected despite the registered claim

In a clean desktop UI context with an instrumented native bridge:

1. Opened **Add first source**.
2. Entered `http://[::1]:8384` and a non-empty fixture key.
3. Selected **Save and inspect**.
4. The dialog stayed open and said “Remote addresses are outside this
   product's scope.”
5. The native `probe_syncthing` call count remained zero.

The production Rust validator accepts `::1`; the TypeScript form does not.
This is a real setup failure for a supported local endpoint and contradicts
claim `local-endpoint-only`.

## Other findings

### Medium — desktop home target is below the touch minimum

At a 390 x 844 CSS viewport, the desktop app's home link measured 48 x 40 px.
All other visible controls measured at least 44 px. The acceptance baseline
requires both dimensions to be at least 44 px.

### Medium — desktop UI does not reflow at 200%

At the 195 px CSS viewport used to represent 200% zoom on the required 390 px
layout, the desktop UI had `clientWidth=195` and `scrollWidth=320`. Visible
controls extended beyond the viewport: **Configure sources** ended at x=306,
**Add first source** at x=222.1, and **Try sample data** at x=212.5. The live
site and live demo both reflowed without horizontal overflow at the same size.

## End-to-end behavior

Independent desktop-browser exercise used a controlled native bridge and
fresh storage:

- Empty state showed no source and offered **Add first source** and
  **Try sample data**.
- A remote endpoint (`https://sync.example.com`) produced the documented,
  actionable validation error and made zero provider calls.
- Recovering to `http://127.0.0.1:8384` saved the source and made one probe.
- A controlled conflict appeared as “1 conflict file needs attention.”
- **Refresh status** then recovered the same source to “Every reported folder
  has zero pending items.”
- Keyboard order began with the skip link, all sampled controls had a visible
  4 px blue focus ring, the dialog focused `syncName`, and Escape closed it.
- Axe reported no serious or critical findings in the tested app state.

The core Rust integration tests exercised loopback Syncthing responses,
conflict priority, offline devices, partial readings, metadata-only folder
scans, scan bounds, GET-only behavior, and Nextcloud log states. All 9 passed.

## Quality gates

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 67 packages, 0 vulnerabilities |
| `npm run audit:copy:check` | PASS |
| `npm test` | PASS — 14/14 |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — exact production build created `dist/app` and `dist/site` |
| `npm run test:e2e` | PASS — 50/50 across desktop and 390 px mobile projects |
| Core Rust format/test/clippy | PASS — 9/9 tests; zero warnings under `-D warnings` |
| Tauri Rust format/test/clippy | PASS after installing the workflow-declared WebKit/GTK packages |
| Candidate GitHub quality-gates run | PASS — run `33586061879` |

Production output remains well below the budgets: app JS is 23.65 KB total
uncompressed (7.88 KB for the main chunk gzip) and app CSS is 11.09 KB. Site
JS is 3.37 KB uncompressed, site CSS is 12.49 KB, and the initial hero WebP is
82.06 KB.

## Live accessibility, privacy, offline, and delivery

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each have `lang=en`,
  one H1, one main landmark, route-specific metadata, no horizontal overflow
  at 390 px, no console/page errors, and zero serious/critical Axe findings.
- An unknown path returns the designed 404 with HTTP 404. Chromium emits its
  normal failed-document console message for that deliberate 404.
- The fresh landing request log contained only the product origin and the
  disclosed `https://api.github.com` release lookup. It created no cookies.
- A fresh direct demo visit contacted only the product origin, created no
  cookies, and used only `demo:local-sync-observer.site.v1`.
- Reset restored the sample while preserving a real-data sentinel. Leaving
  demo removed the demo key and preserved that sentinel.
- `/sw.js` was activated, `registration.update()` completed, and a subsequent
  offline reload retained the sample conflict.
- Reduced-motion media matched; UI durations were `0.00001s`, iteration count
  was one, and scroll behavior was `auto`.
- Home responses include HSTS, `nosniff`, strict referrer policy, permissions
  policy, and a CSP containing `frame-ancestors 'none'` and only the disclosed
  GitHub API in `connect-src`.
- Hashed assets return `Cache-Control: public, max-age=31536000, immutable`;
  HTML and the service worker use revalidation/no-cache behavior.
- Every unique live link checked returned HTTP 200 after redirects.

Lighthouse 13.4.1 mobile results: **Performance 100, Accessibility 100, Best
Practices 100, SEO 100**. FCP was 1.0 s, LCP 1.2 s, TBT 10 ms, CLS 0.002, and
total initial transfer was 187,735 bytes. Initial script transfer was 1,695
bytes; there were no console errors.

## Deployment and release identity

All 23 deployable files in the local `dist/site` build matched the live
responses byte-for-byte by SHA-256, including HTML routes, hashed JS/CSS,
service worker, installers, images, robots, and sitemap. The live deployment
therefore matches candidate `2d4d8383…`.

The current public release is non-draft `v0.1.6`. It has six packages and both
manifest files: macOS arm64 and Intel DMGs, Windows MSI and EXE, and Linux
AppImage and DEB. `latest.json` names source commit
`975d41d47926f5981af923e47cf82d32aca7074e`, an ancestor of the candidate.
There is no runtime-source diff between that release commit and the candidate.

The downloaded Debian package identified `local-sync-observer 0.1.6 amd64`.
Its SHA-256 was
`10f562814591ad9bc8214c164cd9114eff6532c3f82fd0711adca7efa440afe4`,
matching both `latest.json` and `SHA256SUMS`. Its executable remained healthy
for the full eight-second virtual-display smoke test and exited only when the
harness timed out. The observed graphics/session-bus warnings were expected
for the headless container.

This static product exposes no first-party server endpoint or product-unlock
call, so request-allowance/429 testing is not applicable. It has no sign-in,
so Entra authority validation is also not applicable.

## Required next steps

1. Detect Android/iOS and replace the Linux download with a desktop-only
   handoff; add claim coverage for unsupported mobile user agents.
2. Normalize bracketed IPv6 hostnames in the desktop form and extend
   `local-endpoint-only` to exercise `http://[::1]:8384` through the UI.
3. Make the desktop brand link at least 44 px high.
4. Remove the desktop UI's 320 px reflow floor or provide an equivalent 200%
   layout without clipped controls.
