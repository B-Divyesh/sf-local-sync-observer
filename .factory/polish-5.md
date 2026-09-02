# Polish round 5 — complete

Reviewed candidate: `a525ced8fb0f69908fd824d62804acfb41a3ff3b`.
Review report: `d32dcb2681e30be2d6b9c96f61196a4374a4cb7d`.
Repair implementation: `416bc59486cf37bf68974f064772d067cc171620`.
Static deployment: `53aa5c31-3a5b-4f31-9b04-89894bece59b`.

Every earlier review and polish report was read. The three round-5 findings
are repaired, and every earlier closure was retested.

## Finding closure

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Kept filesystem, scan-bound, and endpoint logic in dependency-light `observer-core`. | The three exact Cargo claim commands pass from the clean clone; `polish-5-evidence/clean-claims-summary.txt`. |
| F-1-2 | Retained the complete 26-entry claim registry and removed no proof. | All 26 exact registered commands pass independently from the clean clone. |
| F-1-3 | Retained route-specific descriptions, canonicals, Open Graph/Twitter tags, favicon, and Apple-touch icon on all public pages. | Playwright `public routes use complete metadata...`; live route results in `polish-5-evidence/live-check.json`. |
| F-1-4 | Retained one header and footer navigation set across home, demo, legal, and 404 pages. | The shared-navigation Playwright test and live route crawl pass. |
| F-1-5 | Retained descriptive headings and result-naming actions. | `npm run audit:copy:check`; `.factory/copy-audit.md`. |
| F-1-6 | Retained the designed true 404 and route-heading focus. | Playwright `unknown-page artifact...`; live `/does-not-exist` returns 404, focuses its h1, and has zero serious/critical Axe findings. Chromium reports only the expected main-document 404 status. |
| F-1-7 | Retained short README sentences and consistent terms. | `tests/copy-audit.test.ts`; generated `.factory/copy-audit.md`. |
| F-2-1 | Retained fixture-tested production Syncthing readings, details, and non-changing behavior. | `syncthing-reading`, `reading-details`, and `read-only-probe` claim commands pass in the clean clone. |
| F-2-2 | Retained public checksum wording limited to the tested macOS/Linux shell installer. | `@claim:checksum-install`; the downloaded v0.1.7 Debian package matches `SHA256SUMS`. |
| F-2-3 | Retained tray updates containing only the reading and attention count. | `@claim:tray-status` and `claim_tray_status_names_the_reading_without_file_details`. |
| F-2-4 | Retained plain first-run language and current v0.1.7 walkthroughs. | `npm run audit:copy:check`; `public/assets/walkthrough-manifest.json`; browser walkthrough test. |
| F-2-5 / F-5-1 | Removed the duplicate runtime platform note. Phones now show one handoff, hide the unusable package action, and keep all three facts above the fold. | `@claim:mobile-desktop-handoff` now uses Pixel 5 and iPhone 13 contexts at 390 × 844 and checks every `.trust-list li`; live bottoms are 690.73, 722.88, and 755.02 px in `live-check.json`; `live-home-pixel5.png` and `live-home-iphone13.png`. |
| F-2-6 | Retained named GitHub destinations and accessible external-site suffixes. | Live crawl returned 200 for all nine unique internal, source, issue, and release links. |
| F-2-7 / F-3-2 / F-5-2 | Runtime strings now pass through the sentence segmenter before one final deduplication step. README sentences are deduplicated too. | Vitest `lists each mobile handoff sentence once without merging them`; the generated audit has 33 unique landing rows and 49 unique README rows. |
| F-3-1 | Retained direct desktop labels and current screenshots for Syncthing, Nextcloud, and folder setup. | Desktop empty/setup browser tests and the three-frame walkthrough test pass. |
| F-3-3 | Retained deletion of GitHub release cache data after one hour. | `@claim:release-cache-retention` passes in the clean clone. |
| F-3-4 | Retained the read-only Nextcloud desktop-log adapter and mixed-provider sample. | `claim_nextcloud_desktop_log_reports_status_and_preserves_log` and `@claim:mixed-provider-demo` pass. |
| F-4-1 | Retained explicit claim entries for both sample providers and source-gated checks. | `@claim:mixed-provider-demo` and `@claim:checks-require-source` pass from the clean clone. |
| F-5-3 | Route history entries now store their own scroll coordinates. Back/Forward restoration runs after route focus and again after the asynchronous release note settles. | Playwright `Back and Forward restore each route's scroll position and heading focus`; live history is `1000 → 0 → 1000 → 0` with h1 focus throughout in `live-check.json`; `live-history-restored.png`. |

## Verification

- Clean clone: all 26 exact `.factory/claims.json` commands passed; see
  `polish-5-evidence/clean-claims-summary.txt`.
- `npm run audit:copy:check`: passed.
- `npm run check`: passed with 15/15 Vitest checks and both production builds.
- `npm run test:e2e`: passed, 54 executed and 4 intentional platform skips.
- History restoration passed five consecutive focused runs.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: 9/9 passed.
- Core and Tauri formatting passed. Core and Tauri clippy passed with
  `-D warnings`; the Tauri crate test target compiled and passed.
- Live `verify-url.sh`: HTTP 200, title/lang/main/alt/control checks passed,
  with no console errors; see `polish-5-evidence/verify-url/verify.json`.
- Live Axe checks: zero serious or critical violations on home, demo,
  Privacy, Terms, and the true 404.
- Live demo: one-click redirect, isolated storage, reset, exit cleanup,
  same-origin requests, and offline reload all passed.
- Live deployment integrity: all 23 served build files match local SHA-256.
- Live link crawl: all nine unique destinations returned 200.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.2 s, TBT 70 ms, CLS 0.003, total 181 KiB.
- GitHub quality-gates run
  [33598894760](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33598894760)
  passed for the repair implementation.
- Public release `v0.1.7` remains valid: six desktop packages plus
  `SHA256SUMS` and `latest.json`. A fresh Debian download matched its checksum
  and identified package `local-sync-observer` 0.1.7 amd64.

## Live evidence

- <https://local-sync-observer.sociobot.in/>
- <https://local-sync-observer.sociobot.in/?demo=1>
- `polish-5-evidence/live-home-pixel5.png`
- `polish-5-evidence/live-home-iphone13.png`
- `polish-5-evidence/live-history-restored.png`
- `polish-5-evidence/live-demo-mobile.png`
- `polish-5-evidence/live-404-mobile.png`
- `polish-5-evidence/live-check.json`
- `polish-5-evidence/lighthouse-live.json`

No review finding remains open.
