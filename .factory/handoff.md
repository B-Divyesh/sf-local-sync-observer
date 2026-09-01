# Local Sync Observer — review 2 handoff

## Status: FAIL

Completed a fresh first-read product review of commit
`ee01672c67ce8d8bcc57977759a99916b1c9cd00` and the live site at
<https://local-sync-observer.sociobot.in/>. The full report is
`.factory/review-2.md`.

No product code was changed. Review evidence is in
`.factory/review-2-evidence/`.

## What was checked

- Cold first screens at 390 × 844 and 1440 × 900.
- One-click demo content, banner, reset, exit, storage separation, requests,
  and offline reload.
- Every registered claim command from a clean checkout.
- Complete landing and README copy, headings, controls, and terminology.
- Earlier review and polish findings against both live output and source.
- Titles, headings, descriptions, canonicals, social metadata, icons, 404,
  deep links, Back/Forward behavior, route focus, headers, footers, and links.
- Live Axe checks and the repository's full desktop/mobile Playwright suite.
- Product scope, tray behavior, and whether another feature is clearly implied.

## Verification results

- All 16 commands in `.factory/claims.json`: pass independently.
- `npm run check`: pass; 11 Vitest checks and both production builds.
- `npm run test:e2e`: pass; 40/40 Playwright checks.
- Live demo request origins: same origin only.
- Live landing request origins: product origin and disclosed GitHub API only.
- Live route Axe results: no serious or critical findings.
- Normal crawled destinations: 200.

## Remaining work

The blocking issue is incomplete claim coverage. The live headline and feature
copy promise a real Syncthing reading, detailed coverage fields, and broad
non-changing behavior, but no registered claim runs the production Syncthing
probe against a controlled local fixture.

The report also records incomplete Windows installer claim coverage, missing
tray status, technical copy, an incomplete first-screen fact set, unlabeled
external destinations, and errors in the committed copy-audit counts.

Run the same clean-checkout claim commands, `npm run check`, and
`npm run test:e2e` after those findings are addressed. Then repeat the entire
live checklist; acceptance requires zero findings.
