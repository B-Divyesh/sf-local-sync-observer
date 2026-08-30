# Independent product verification — FAIL

- Date: 2026-08-30 UTC
- Candidate: `0f9671db2a5149780619c5df2695566310203ce4`
- Live URL: `https://local-sync-observer.sociobot.in`
- Work order: `local-sync-observer-verify-2`
- Result: **FAIL — release blocked**

## Decision

The repaired landing page and sample sandbox are clear, fast, private, accessible at normal zoom, and byte-for-byte deployed from this candidate. The candidate is still not releasable:

1. The required `v0.1.1` desktop release does not exist. Its GitHub Actions release run failed on Windows, skipped finalization, and published no release. The live site says `v0.1.1` but sends users to older `v0.1.0` binaries.
2. `.factory/claims.json` omits the product's central behavior, privacy, local-storage, and installer claims. Its release-download test can also pass without proving the promised asset URL.
3. The live 404 page is unstyled and produces four console/CSP errors.
4. At 200% browser zoom on the required 390 px viewport, the landing page expands to 706 px and clips its headline and copy.

The first two findings independently fail explicit acceptance gates.

## Mandatory first-read and demo gate — PASS

Cold load, before implementation review:

- What it does: checks what synced after offline work and shows pending files, conflicts, and local device status.
- For whom: people using Syncthing.
- What to click first: **Try it with sample data**.

The action is in the first viewport and opens `/demo/` in one click. The sample immediately shows a realistic `Field notes` conflict. Its persistent banner provides **Reset demo** and **Start for real**.

Evidence: [`verification-evidence/live-first-read-desktop.png`](verification-evidence/live-first-read-desktop.png).

## Claims gate — FAIL

`.factory/claims.json` exists. Before any broader repository inspection, each exact command initially reported missing `@playwright/test`, as expected before dependencies were installed in a clean clone. After the documented `npm ci`, all four prescribed commands passed on desktop and 390 px mobile:

| Claim | Exact command | Result |
| --- | --- | --- |
| `release-downloads` | `npm run test:e2e -- --grep @claim:release-downloads` | PASS, 2/2 |
| `isolated-demo` | `npm run test:e2e -- --grep @claim:isolated-demo` | PASS, 2/2 |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | PASS, 2/2 |
| `offline-demo-reload` | `npm run test:e2e -- --grep @claim:offline-demo-reload` | PASS, 2/2 |

The registry is nevertheless incomplete. Material unlisted claims include:

- “Reads status, not file contents”; “never opens or transmits file contents.”
- “No account or telemetry”; “no cookies or analytics.”
- credentials, paths, and status remain in local storage.
- the observer never resolves, renames, deletes, or changes a file.
- folder-only evidence never establishes convergence.
- scans are capped at 50,000 entries and depth 16.
- the one-line installers verify SHA-256 before installing or opening anything.
- the desktop app refreshes every 30 seconds.

The `release-downloads` test is also not a valid proof of its registered claim. It intercepts an AppImage URL but accepts `/AppImage|releases/`; the unchanged generic fallback `/releases/latest` satisfies that assertion. It does not assert the exact intercepted `browser_download_url` as the claim's sandbox description requires.

Under the supplied “every claim is a test” contract, either condition is release-blocking.

## Release and installer gate — FAIL

- Tag `v0.1.1` exists at `b05da6b73d6a23f8f7f7256e2cac2b1241c2c9fa`. The two commits between it and the candidate change factory documentation only.
- Release run `33297898822` concluded **failure**. macOS arm64/x64 and Linux build jobs passed; Windows failed at `npm test`; `finalize` was skipped.
- GitHub's Releases API lists only `v0.1.0`. There is no published `v0.1.1`, `latest.json`, `SHA256SUMS`, MSI/EXE, DMG, AppImage, or DEB for this candidate.
- The live page footer and package metadata say `v0.1.1`, while its detected Linux link resolves to `Local.Sync.Observer_0.1.0_amd64.AppImage` from commit `b664858`.
- Fresh download of that older AppImage produced SHA-256 `cc00e3ad7826715698bf9a7462bed23b37937fe3bf8d0375c2c84a5f0d9755b8`, matching both the old `latest.json` and `SHA256SUMS`. It remained running for the 10-second Xvfb smoke window. This does not substitute for a candidate build.

Because the installer contract forbids treating locally built platform binaries as releases, the candidate's real native job could not be exercised from an installable candidate artifact.

## Defects

### Critical / release-blocking

1. **No candidate desktop release.** `v0.1.1` packaging failed on Windows and never finalized. The live `v0.1.1` site installs the older `v0.1.0` product.
2. **Claims coverage is incomplete and one registered test is too weak.** Core behavior/privacy/installer promises have no claim entries or sandbox tests. The download test accepts its generic release-page fallback instead of requiring the intercepted asset URL.

### High

1. **The live 404 is broken and logs errors.** An unknown path correctly returns HTTP 404, but `public/404.html` requests `/site.css`, which is not emitted. The stylesheet response is HTML, so Chromium rejects its MIME type. The page renders as unstyled browser defaults and logs two 404 errors, the MIME error, and an inline-style CSP violation. Evidence: [`verification-evidence/live-404-desktop.png`](verification-evidence/live-404-desktop.png).
2. **The landing page fails 200% reflow.** At 390 px and 200% zoom, `scrollWidth` is 706 px. The headline and body copy are visibly clipped and require horizontal scrolling. Evidence: [`verification-evidence/live-home-mobile-200pct.png`](verification-evidence/live-home-mobile-200pct.png).

### Medium

1. **Some click/touch targets remain below 44 CSS px.** Examples include the 39×44 `Terms` link and the 193×19 inline issue-tracker link. The focusable install command is 39 px high.
2. **The required desktop screenshot walkthrough is incomplete.** The landing page has one product mockup and three text-only walkthrough cards, rather than the required three-to-five captioned product frames.
3. **The copy audit is partial.** `.factory/copy-audit.md` counts only six first-screen lines, not every landing-page sentence as required by the plain-words acceptance rule.

## End-to-end and recovery evidence

The browser app shell was exercised from the exact production build at both desktop and 390 px:

- Empty state clearly says no source means no convergence claim.
- Sample data enters the separate `demo:local-sync-observer.v1` namespace, exposes one conflict immediately, resets, and discards the demo key on **Start for real**.
- A remote `https://sync.example.com` endpoint is rejected inline; the dialog stays open for correction.
- Correcting it to `http://127.0.0.1:8384` proceeds and produces the expected browser-only “Native checks run in the installed desktop app” offline state.
- That result survives reload. Removing the source recovers to the empty state.
- Folder selection outside Tauri returns the actionable “available in the installed desktop app” error.
- Source-dialog initial focus, Escape dismissal, mobile layout, and serious/critical axe checks pass.

The live demo was additionally seeded with malformed JSON plus a sentinel real-data key. It recovered its sample, preserved the real sentinel through reset, made only same-origin requests, and reloaded offline with the conflict visible.

## Verification matrix

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | PASS | `HEAD` exactly `0f9671db2a5149780619c5df2695566310203ce4` |
| Clean install | PASS | `npm ci`; 67 packages, 0 vulnerabilities |
| Claim commands | PASS individually | 8/8 project runs after install |
| Claims completeness | **FAIL** | central behavior/privacy/installer claims unlisted; download assertion weak |
| Type/unit/build aggregate | PASS | `npm run check`; TypeScript, 6/6 tests, app and site builds |
| Exact production build | PASS | `dist/app` and `dist/site` produced |
| Full Playwright suite | PASS | 20/20 desktop/mobile |
| Rust formatting | PASS | `cargo fmt --check` |
| Rust tests | PASS | 3/3 after installing repository-declared Linux dependencies |
| Rust lint | PASS | `cargo clippy --all-targets -- -D warnings` |
| Candidate native artifact | **FAIL** | `v0.1.1` release absent; Windows release job failed |
| Browser app normal/invalid/recovery flow | PASS | sample conflict, remote rejection, correction, persistence, removal |
| Live desktop/mobile axe | PASS | no serious/critical findings on home, demo, privacy, terms |
| Keyboard/focus | PASS | skip link first; 4 px focus outline; dialog initial focus and Escape |
| Touch targets | **FAIL** | multiple targets below contractual 44×44 minimum |
| Reduced motion | PASS | transitions/animations reduced to 0.01 ms |
| Normal 390 px overflow | PASS | zero horizontal overflow on all public routes and app |
| 200% zoom/reflow | **FAIL** | 706 px document width in a 390 px viewport; clipped content |
| Live console/page errors | **FAIL** | home/demo/legal clean; unknown route produces four console/CSP errors |
| Live demo privacy | PASS | only same-origin HTML/CSS/JS/SW requests; no cookies |
| Landing privacy | PASS as disclosed | self-hosted assets plus only `api.github.com`; cached response in localStorage |
| Headers | PASS on normal routes | CSP with header-only `frame-ancestors`, HSTS, `nosniff`, referrer and permissions policies |
| Caching | PASS | hashed assets one year immutable; home/SW no-cache |
| Service worker | PASS | update resolved; active `/sw.js`; demo reloaded offline |
| Link crawl | PASS with stale release | all internal fragments/pages and external targets resolve; downloads are v0.1.0 |
| Bundle budgets | PASS | site JS 2.73 KB, CSS 10.47 KB, hero 82.06 KB; app JS 20.44 KB, CSS 10.99 KB uncompressed |
| Lighthouse mobile | PASS | Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, TBT 0 ms, CLS 0.003, 92 KiB transfer |
| Live matches candidate | PASS for static site | 12 representative HTML/JS/CSS/SW/installer/image files match local `dist/site` SHA-256 byte-for-byte |
| Rate limit | N/A | no product server API or unlock endpoint |
| Sign-in | N/A | no authentication |
| AI leverage | N/A | the read-only deterministic observer does not benefit from an AI runtime |

## Privacy and deployment identity

- Source and live request review found no analytics, ad, CDN-font, AI, payment, or account calls.
- The public page contacts `api.github.com` only for documented release metadata. `/demo/` is same-origin only.
- The live site matches the candidate's static production build for home, demo, privacy, terms, 404, service worker, demo script, both installers, hero, hashed CSS, and hashed JS.
- There are no server-side product endpoints, so rate-limit and persistence-concurrency checks do not apply. Desktop state uses namespaced local WebView storage; the static demo uses a separate browser key.

## Final result

**FAIL. Do not release candidate `0f9671d`.** Publish a successful candidate desktop matrix, make the site and binaries report the same version, register and genuinely test every material claim, repair the 404 asset/CSP path, and fix 200% reflow before re-verification.
