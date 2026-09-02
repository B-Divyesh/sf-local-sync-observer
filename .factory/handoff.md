# Local Sync Observer — adversarial review 3 handoff

## Status: FAIL

Independent first-read review of commit
`8932101d7daba7c20ca29409e18a745579766e1d` and the live v0.1.5 site completed
on 2026-09-02 UTC. Product code was not changed.

The complete report is in `.factory/review-3.md`. Supporting live and local
captures are in `.factory/review-3-evidence/`.

## What was verified

- Cold first screens at 390 × 844 and 1440 × 900.
- One-click demo entry, realistic sample visibility, Reset, exit, storage
  namespace isolation, live offline reload, and outgoing requests.
- Every command in `.factory/claims.json` from a clean clone: 21/21 passed.
- Every earlier review and polish finding against the live site and current
  source.
- Route metadata, 404 behavior, shared navigation, deep links, Back/Forward,
  focus, link status, mobile reflow, touch targets, reduced motion, Axe, and
  the product-specific visual system.
- A fresh landing/README copy inventory with word counts.

## Findings left for the owner

- `F-3-1 / F-2-4`: current app first-run copy still uses internal jargon, and
  live walkthrough images show obsolete labels.
- `F-3-2 / F-2-7`: the generated copy audit still omits complete landing
  sentences and rewrites the README demo URL before counting it.
- `F-3-3`: the privacy page's one-hour release-cache claim is unlisted and is
  false when an expired entry remains after a failed GitHub refresh.
- `F-3-4`: the cross-tool product still has only one provider-specific adapter.

## Commands run

```bash
npm ci
npm run audit:copy:check
npm run check
cargo test --manifest-path crates/observer-core/Cargo.toml
npm run test:e2e
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh \
  https://local-sync-observer.sociobot.in .factory/review-3-evidence/verify-url
```

The repository remains buildable: `npm run check` passed, core Rust tests
passed 8/8, and Playwright passed 44/44. Review 3 remains `FAIL` until all four
findings are closed and the unlisted privacy claim has an observable test.
