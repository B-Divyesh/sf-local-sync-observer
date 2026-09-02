# Polish round 4 — complete

Repair commit: `42d96d3a4ec70bbc28e2f86415cb07d06e92750a`.
Reviewed candidate: `96f0a80470497abe684d9dc11066951bb98c928e`.
Review report: `af0aef49f02d5c291f884329d92f52271d1220ba`.

All four review files and all three earlier polish files were read. Every
finding is closed below. The round-4 repair adds the two exact claims requested
by the controller, gives each one a tagged observable test, and keeps the
existing product and release behavior unchanged.

## Finding closure

| Finding | Change or retained fix | Evidence |
| --- | --- | --- |
| F-1-1 | Pure scan and endpoint checks remain in dependency-light `observer-core`, independent of Tauri system libraries. | The three registered Cargo commands pass in the clean clone; `clean-claims-summary.txt`. |
| F-1-2 | Unprovable copy remains removed. Every current product promise is represented by one of 25 registered claims. | All 25 registry commands pass; `clean-claims-summary.txt`. |
| F-1-3 | Home, demo, privacy, terms, and 404 retain route-specific descriptions, canonicals, Open Graph, Twitter, favicon, and Apple-touch metadata. | `public routes use complete metadata, shared navigation, and route-heading focus`; live route results in `live-check.json`. |
| F-1-4 | The same four header links and three footer links remain on every public route. | The shared-navigation Playwright test passes; live home/demo/404 screenshots below. |
| F-1-5 | Descriptive section headings and result-naming actions remain in place. | `npm run audit:copy:check`; `live-home-desktop.png`. |
| F-1-6 | Unknown URLs return the designed HTTP 404, focus its heading, and load every product asset. | `unknown-page artifact is styled...`; live `/does-not-exist` is 404 in `live-check.json`; `live-404-mobile.png`. Chromium's expected main-document 404 message is the only recorded console line. |
| F-1-7 | README sentences remain short and use the established product terms. | `npm run audit:copy:check`; `.factory/copy-audit.md`. |
| F-2-1 | Production Syncthing probing remains fixture-tested for folder/device state, conflict priority, missing fields, GET-only access, and unchanged files. | `syncthing-reading`, `reading-details`, and `read-only-probe` registered commands pass. |
| F-2-2 | Public checksum wording remains limited to the tested macOS/Linux shell installer. | `@claim:checksum-install`; downloaded v0.1.6 Debian package matches SHA-256 `10f562814591ad9bc8214c164cd9114eff6532c3f82fd0711adca7efa440afe4`. |
| F-2-3 | The tray still receives only overall state and attention count. | `@claim:tray-status` plus core test `claim_tray_status_names_the_reading_without_file_details`. |
| F-2-4 | Desktop and landing copy remain in direct user language with current control names. | `app-no-sources.png`, `app-source-setup.png`, and `npm run audit:copy:check`. |
| F-2-5 | The action result and offline, account/telemetry, and license facts remain above the fold. | `@claim:offline-demo-reload`, `@claim:no-product-account`; `live-home-mobile.png`; `firstScreen.mobile.allWithinViewport` is true in `live-check.json`. |
| F-2-6 | External destinations name GitHub and retain an accessible external-site suffix. | Shared route test and live release URLs in `live-check.json`. |
| F-2-7 | The generated audit still covers the h1, annotation, runtime copy, README URL, and terminology without rewriting source text. | `tests/copy-audit.test.ts`; `npm run audit:copy:check`. |
| F-3-1 / F-2-4 | First-run labels remain `SYNC STATUS` and `NO SOURCES ADDED`; current walkthrough frames include Syncthing, Nextcloud, and folders. | `app-no-sources.png`, `app-source-setup.png`, and live walkthrough in `live-home-desktop.png`. |
| F-3-2 / F-2-7 | Copy auditing preserves `?demo=1`, counts all reviewed sentences, and normalizes checkout line endings. | Both `tests/copy-audit.test.ts` tests and `npm run audit:copy:check` pass. |
| F-3-3 | Expired GitHub release data is still deleted after one hour before fallback. | `@claim:release-cache-retention` passes in the clean clone. |
| F-3-4 | The read-only Nextcloud desktop-log adapter and mixed-provider sample remain functional. | Core test `claim_nextcloud_desktop_log_reports_status_and_preserves_log`; `@claim:mixed-provider-demo`; `live-demo-mobile.png`. |
| F-4-1 | Added exact `mixed-provider-demo` and `checks-require-source` entries to `.factory/claims.json`. The demo test asserts the named Syncthing conflict-copy and Nextcloud pending-log evidence. The desktop test instruments the production command bridge and proves no provider command before **Save and inspect**, followed by exactly one Syncthing probe. | `@claim:mixed-provider-demo` and `@claim:checks-require-source` pass on desktop and mobile. `source-gate-check.json` records `[]`, `[]`, then `["probe_syncthing"]`. Cold live `/demo/?demo=1` shows both rows and exact explanations in `live-check.json` and `live-demo-mobile.png`. |

## Final verification

- Clean remote clone: all 25 exact claim commands passed independently; see
  `polish-4-evidence/clean-claims-summary.txt`.
- `npm run audit:copy:check`: passed.
- `npm run check`: passed with 14/14 Vitest tests and both production builds.
- `npm run test:e2e`: passed 50/50 across desktop and 390 px projects.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: passed 9/9.
- Both Rust formatting checks, Tauri tests, and Tauri clippy with
  `-D warnings`: passed.
- Live `verify-url.sh`: HTTP 200, title/lang/main/alt/button checks passed, and
  no console error was reported.
- Live Axe: zero serious or critical findings on home, demo, privacy, terms,
  and the true 404; see `live-check.json`.
- Live demo: same-origin requests only, real-data sentinel unchanged through
  reset, demo key removed on exit, and sample survives offline reload.
- Lighthouse 13.4.1 desktop: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100, LCP 333 ms, CLS 0, TBT 0; see
  `lighthouse-live.json`.
- Release `v0.1.6`: six installers plus `SHA256SUMS` and `latest.json`; the
  manifest identifies source commit `975d41d47926f5981af923e47cf82d32aca7074e`.
- GitHub quality-gates run
  [33585301112](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33585301112)
  passed for repair commit `42d96d3`.

## Deployment and screenshots

Static deployment `4c937ef9-e2f2-47ea-8bd5-b8dff7f838fc` completed on
2026-09-02 UTC. Cold verification used
<https://local-sync-observer.sociobot.in/> and
<https://local-sync-observer.sociobot.in/demo/?demo=1>.

- `polish-4-evidence/live-home-desktop.png`
- `polish-4-evidence/live-home-mobile.png`
- `polish-4-evidence/live-demo-mobile.png`
- `polish-4-evidence/live-404-mobile.png`
- `polish-4-evidence/app-no-sources.png`
- `polish-4-evidence/app-source-setup.png`

No review finding remains open.
