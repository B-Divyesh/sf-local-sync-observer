# Local Sync Observer — review 5 handoff

## Outcome

Adversarial first-read review 5 is **FAIL** for commit
`ad3ae8eb3de82ba6d282373b7deffbecf34e16dc` at
<https://local-sync-observer.sociobot.in/>. The full report is
[`.factory/review-5.md`](review-5.md).

No product code was changed. The review added browser and claim evidence under
`.factory/review-5-evidence/`.

## Findings left for the repair pass

1. `F-5-1 / F-2-5`: actual Android and iPhone contexts clip the third required
   first-screen fact because two platform handoff messages repeat each other.
2. `F-5-2 / F-2-7 / F-3-2`: the generated copy audit lists those two phone
   sentences individually and then repeats them as one combined sentence.
3. `F-5-3`: Back returns to the landing URL and focused h1 but resets the prior
   scroll position from 1000 to 0.

## Verification completed

- All 26 exact claim commands passed independently from a clean clone after
  `npm ci --include=dev`; see `review-5-evidence/claims-summary.txt`.
- `npm run audit:copy:check`, `npm run check`, `npm run test:e2e`, and
  `cargo test --manifest-path crates/observer-core/Cargo.toml` passed.
- The live demo reset, real-storage sentinel, exit, same-origin request log,
  and offline reload checks passed.
- Live route metadata, 404, link crawl, Axe, security headers, and
  `verify-url.sh` checks passed.

## How to verify the findings

- Open `/` at 390 × 844 with Pixel 5 or iPhone 13 emulation. The final **Free
  under the MIT License** fact ends at pixel 849.
- Run `npm run audit:copy:check`, then inspect landing rows 5, 6, and 35 in
  `.factory/copy-audit.md`; the passing command currently preserves the
  duplicate combined row.
- At desktop width, scroll `/` to 1000, follow the Privacy header link, then
  use Back. The URL and h1 restore, but `scrollY` becomes 0.

## Recommended next step

Make the three narrow fixes and add the viewport, copy-audit uniqueness, and
history-scroll regression tests specified in the review. Then rerun the full
claim matrix and adversarial checklist from fresh contexts.
