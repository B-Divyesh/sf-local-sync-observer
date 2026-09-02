# Local Sync Observer — polish round 3 handoff

## Status: complete

This repair closes every finding in reviews 1, 2, and 3. The main repair is
`5321e407612d8fdbefa78382a6c12c5cc45a3ea5`; the final public walkthrough
caption correction is `965b547a0a7955118c6c071869134cd5e70317fa`; and
`975d41d47926f5981af923e47cf82d32aca7074e` makes the audit deterministic on
Windows CRLF checkouts too.

## What changed

- Added a real, read-only Nextcloud Desktop-log adapter. It reads only the
  recent local log, recognizes conflict/offline/pending/completed states, and
  shows honest limits where an exact pending count is unavailable.
- Reworked the direct desktop first-run language and recorded current v0.1.6
  walkthrough images. The website, alt text, and captions now name the same
  Syncthing, Nextcloud, and folder choices.
- Made `?demo=1` enter an isolated mixed-provider sample. It has the persistent
  sample banner, Reset demo, Start for real/download exit, `demo:` storage only,
  and no third-party demo requests.
- Fixed expired release-cache deletion, registered its retention claim, and
  rewrote the copy auditor so it covers rendered h1/annotation/caption text and
  preserves literal demo URLs.
- Preserved the warm-paper, ink, signal-yellow field-instrument visual system;
  it was not replaced by a generic template.

## Verify locally

```bash
npm ci --include=dev
npm run audit:copy:check
npm run check
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npx playwright test --workers=1
```

For claim verification, run every exact `test` string in
`.factory/claims.json`. A fresh clone of `975d41d` ran all 23 successfully;
the exact command/result list is
`.factory/polish-3-evidence/clean-claims-summary.txt`.

Results from the final local pass:

- `npm run check`: TypeScript passed, 14/14 Vitest tests passed, and production
  app/site builds completed. Initial app JavaScript is 7.88 KB gzip; landing
  JavaScript is 1.15 KB gzip.
- `npx playwright test --workers=1`: 48/48 desktop and mobile tests passed,
  including Axe, keyboard/focus, responsive 200% reflow, offline demo, privacy,
  routes, titles, and 404 checks.
- Lighthouse mobile report: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.81 s and CLS 0.002. See
  `.factory/polish-3-evidence/lighthouse-local.json`.

## Deployment and live verification

Static deployment `06780583-22bf-4848-a690-732ca4147f4c` completed successfully
to [local-sync-observer.sociobot.in](https://local-sync-observer.sociobot.in).
Cold live checks confirmed the one-click demo, cache expiry behavior, metadata,
legal pages, one h1/main per route, console cleanliness, mobile layout, and no
serious/critical Axe findings. Evidence is in
`.factory/polish-3-evidence/live-check.json` and the adjacent screenshots.
`/does-not-exist` is a real HTTP 404 and focuses its h1; Chromium correctly
logs the main-document 404 status only, with no product-resource errors.

Release workflow
[`33579357556`](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33579357556)
passed the macOS arm64/x64, Windows MSI/EXE, Linux AppImage/Deb, checksum, and
manifest stages. `latest.json` identifies source commit `975d41d`; its evidence
and `SHA256SUMS` are in `.factory/polish-3-evidence/`. A downloaded Windows
MSI matched its published SHA-256:
`45c96d2bb5fb52644c41d61154e7065b92de9245744d74918e35e9a2cfca9818`.

## Known gaps

None in the product repair. The published v0.1.6 desktop binaries are
intentionally unsigned; users should verify `SHA256SUMS` before installing.
