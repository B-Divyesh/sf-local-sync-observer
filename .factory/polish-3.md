# Polish round 3 — complete

Candidate product code commits: `5321e407612d8fdbefa78382a6c12c5cc45a3ea5`
and `965b547a0a7955118c6c071869134cd5e70317fa`; the final cross-platform
audit check and regression test are
`975d41d47926f5981af923e47cf82d32aca7074e`. This pass read every prior
review and polish record. All review findings are closed below.

## Common final evidence

- Fresh clone of `975d41d`: all 23 exact commands in `.factory/claims.json`
  passed after `npm ci --include=dev`; see
  `.factory/polish-3-evidence/clean-claims-summary.txt`.
- Final local suite: `npm run audit:copy:check`, `npm run check` (14 Vitest
  tests and both production builds), and `npx playwright test --workers=1`
  (48/48 desktop and mobile checks) passed.
- Cold live check: `https://local-sync-observer.sociobot.in` passed
  `verify-url.sh`; see `.factory/polish-3-evidence/live-verify/verify.json`.
  The browser route/Axe report is
  `.factory/polish-3-evidence/live-check.json`: home, demo, privacy, terms,
  and 404 markup each have one h1/main, their route title, no console errors,
  and no serious or critical Axe finding.
- The real unknown URL is an HTTP 404 with focused recovery heading;
  `.factory/polish-3-evidence/live-404-check.json` records the expected
  browser main-document 404 console message and no product-resource or Axe
  error. Screenshots: `live-home-desktop.png`, `live-home-mobile.png`,
  `live-demo-desktop.png`, and `live-404.png` in the same evidence directory.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept filesystem and endpoint work in dependency-free `observer-core`; the Tauri core uses it. | Fresh-clone core claim commands in `clean-claims-summary.txt`; no separate live visual surface. |
| F-1-2 | Kept every material public promise registered and testable; registry now has 23 claims. | All 23 exact claim commands pass; live privacy and demo request checks in `live-check.json`. |
| F-1-3 | Kept route-specific titles, descriptions, canonicals, OG/Twitter cards, icons, robots, sitemap, and security headers. | Live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` route report in `live-check.json`. |
| F-1-4 | Kept the shared header/footer and labeled GitHub links on every public route. | Playwright `public routes use complete metadata, shared navigation, and route-heading focus`; cold live screenshots. |
| F-1-5 | Retained specific headings and verb labels, including `View install options`. | `npm run audit:copy:check`; `live-home-desktop.png`. |
| F-1-6 | Kept the designed true 404, h1 focus, recovery navigation, and valid assets. | Live `/does-not-exist` is HTTP 404 in `live-404-check.json`; `live-404.png`. |
| F-1-7 | Kept the README plain-language rewrites and complete terminology audit. | `npm run audit:copy:check`; `.factory/copy-audit.md`. |
| F-2-1 | Kept production Syncthing fixture coverage for configured folders, pending work, devices, conflicts, details, and GET-only behavior. | `syncthing-reading`, `reading-details`, and `read-only-probe` claim commands pass from fresh clone. |
| F-2-2 | Kept public installer wording limited to the tested macOS/Linux shell installer behavior. | `@claim:checksum-install` passes; landing screenshot shows the narrowed statement. |
| F-2-3 | Kept a persistent tray update carrying only overall reading and attention count. | `@claim:tray-status` and `claim_tray_status_names_the_reading_without_file_details` pass. |
| F-2-4 | Rewrote the desktop empty state in user words and replaced all stale walkthrough frames with current v0.1.6 app captures. | `app-empty.png`, `live-home-desktop.png`, `live-home-mobile.png`, walkthrough manifest checked in `live-check.json`. |
| F-2-5 | Kept the above-the-fold action result and three factual lines at both widths. | `@claim:offline-demo-reload`, `@claim:no-product-account`; live desktop/mobile screenshots. |
| F-2-6 | Kept GitHub named in external links and exposed the external-site suffix for assistive technology. | Live route report and Playwright shared-navigation check. |
| F-2-7 | Replaced the incomplete auditor. It now inventories h1s, annotations, captions, runtime fallbacks, README sentences, and literal URLs without rewriting them. | `tests/copy-audit.test.ts`; `npm run audit:copy:check`; `.factory/copy-audit.md`. |
| F-3-1 | Replaced first-run jargon with `SYNC STATUS`, clear setup guidance, and current screenshots. The setup walkthrough alt text and caption now name Syncthing, Nextcloud, and folders. | `app-empty.png`; live walkthrough proof and current caption in `live-check.json`; `live-home-desktop.png`. |
| F-3-2 | The audit preserves `?demo=1`, counts the landing h1 and annotation, fails if required review strings are omitted, and normalizes CRLF checkout line endings. | `tests/copy-audit.test.ts`, `npm run audit:copy:check`, and current `.factory/copy-audit.md`. |
| F-3-3 | Expired GitHub-release cache entries are deleted before fallback; the privacy and README wording now match this behavior and the claim is registered. | `@claim:release-cache-retention` passes from fresh clone; cold live interception reports fallback plus null cache value in `live-check.json`. |
| F-3-4 | Added a read-only Nextcloud desktop-log adapter, local-file chooser/open action, bounded parsing, coverage limits, and mixed-provider demo data. | `claim_nextcloud_desktop_log_reports_status_and_preserves_log`; `@claim:isolated-demo`; `live-demo-desktop.png` and `live-check.json`. |

The live static deployment was uploaded successfully on 2026-09-02 UTC as
deployment `06780583-22bf-4848-a690-732ca4147f4c` to
`https://local-sync-observer.sociobot.in`. Release workflow
[`33579357556`](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33579357556)
then passed all four desktop build legs and its manifest finalizer. The public
v0.1.6 `latest.json` identifies commit `975d41d`; its platform matrix and
SHA256SUMS are saved as `release-latest.json` and `release-SHA256SUMS`.
`live-release-check.json` records the cold landing page resolving the real
Linux AppImage URL without console errors.
