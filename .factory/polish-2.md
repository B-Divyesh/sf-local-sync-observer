# Polish round 2 — finding closure

Repair base: `bdd430cb1b6a5a0baf69c52007ee385d7e62c913`. Release: `v0.1.4`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the three filesystem and address claims in `crates/observer-core`, which runs without GTK/WebKit. The real Syncthing probe now lives there too. | Exact registered Cargo commands in `.factory/claims.json`; full core suite passes 8/8. |
| F-1-2 | Kept the earlier unprovable statements removed. Registered the release fallback, real Syncthing reading, displayed details, read-only behavior, tray status, and no-account behavior. | All 21 registered commands pass from the clean clone; claim logs in `.factory/polish-2-evidence/claims/`. |
| F-1-3 | Retained route-specific titles, descriptions, canonicals, Open Graph, Twitter, favicon, and Apple touch metadata on all five public pages. | Playwright `public routes use complete metadata...`; live `verify-url.sh` report in `.factory/polish-2-evidence/live/verify.json`. |
| F-1-4 | Retained one shared header and footer link set on home, demo, legal, and 404 pages. External source labels now name GitHub. | Playwright shared-navigation check across five routes. |
| F-1-5 | Retained the descriptive section names and **View install options** from round 1. Replaced the remaining vague h3 and walkthrough labels. | `.factory/copy-audit.md`; Playwright heading and walkthrough checks. |
| F-1-6 | Retained real 404 handling and shared route-heading focus. | Playwright `unknown-page artifact...` and route-focus test; live `/does-not-exist` check. |
| F-1-7 | Kept the three earlier README rewrites and replaced the remaining technical shorthand. | Generated `.factory/copy-audit.md`; `npm run audit:copy:check`. |
| F-2-1 | Moved the production Syncthing probe into the shared core and tested it against a loopback fixture. It checks configured folders, local and device pending items, offline devices, conflicts, last-good values, missing fields, coverage, GET-only requests, and unchanged paths/bytes. Added three claim entries. | `claim_syncthing_reading_reports_configured_folder_and_device_state`, `claim_reading_details_show_last_good_missing_fields_and_coverage`, and `claim_observer_probe_is_get_only_and_does_not_change_files`. |
| F-2-2 | Narrowed public checksum copy to the executed macOS/Linux shell installer claim. The PowerShell script retains its separate verification-before-launch source-order test without making a broader public promise. | `@claim:checksum-install`; `keeps PowerShell verification before installer launch`. |
| F-2-3 | Added a persistent tray id and a native `update_tray_status` command. Every board render sends `Converged`, `Pending`, `Conflict`, `Offline`, `Error`, or `Unknown` plus the attention count. Tooltip copy excludes filenames and paths. | `@claim:tray-status` browser bridge test and `claim_tray_status_names_the_reading_without_file_details` Rust test. |
| F-2-4 | Replaced every listed metaphor, implementation name, ambiguous heading, and inconsistent demo/source term with the review’s plain-language direction. | Generated `.factory/copy-audit.md` has no sentence over 22 words or banned term; source search finds none of the reviewed wording. |
| F-2-5 | Added permanent action-result copy and changed the three first-screen facts to offline demo, no product account/telemetry, and MIT price/license. Tightened desktop spacing so all facts remain above the fold. | `.factory/polish-2-evidence/mobile-first-screen.png` and `desktop-first-screen.png`; `@claim:offline-demo-reload`; `@claim:no-product-account`. |
| F-2-6 | Named GitHub on download, release, source, issue, and README destinations; added an accessible external-site suffix to compact footer links. | Browser route/link checks and live link crawl. |
| F-2-7 | Added a deterministic copy-audit generator. It covers landing sentences, README sentences, headings, controls, runtime variants, terminology, counts, and banned words. | `npm run audit:copy:check`; `.factory/copy-audit.md`. |

## Additional acceptance work

- `/?demo=1` now redirects directly to `/demo/?demo=1`; the isolated banner, reset, exit, offline cache, and real-data sentinel behavior remain intact.
- Release version advanced to `0.1.4` so the tray and probe repairs are tied to new desktop artifacts.
- The 390 × 844 and 1440 × 900 first screens retain the convergence-field-instrument identity and show the complete required first-screen content.
- Local Lighthouse on the production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.8 s, CLS 0.002, TBT 0 ms.

## Verification summary

- `npm run check`: pass, 11 unit/integration tests and both builds.
- `npm run test:e2e`: pass, 44/44 across desktop and 390 px.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: pass, 8/8.
- `cargo test --manifest-path src-tauri/Cargo.toml`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass.
- Both Rust formatting checks: pass.
- `/opt/fleet/lib/verify-url.sh` on the local production build: pass, no console errors.
- Live deployment and release evidence is recorded in `.factory/handoff.md` after publication.
