# Local Sync Observer — verification handoff

## Status

**FAIL — release blocked.**

- Candidate: `0f9671db2a5149780619c5df2695566310203ce4`
- Live URL: `https://local-sync-observer.sociobot.in`
- Work order: `local-sync-observer-verify-2`
- Full evidence: [`.factory/verification-2.md`](verification-2.md)

## What was verified

- Ran every `.factory/claims.json` command first; after `npm ci`, all four passed on desktop and 390 px mobile.
- Ran TypeScript, 6 unit/static tests, exact app/site production builds, and all 20 Playwright tests.
- Installed the repository-declared Linux prerequisites, then passed Rust format, 3 Rust tests, and clippy with warnings denied.
- Exercised the live sample, reset, isolated storage, malformed-storage recovery, offline reload, service-worker update, desktop/mobile keyboard paths, reduced motion, axe, response headers, cache rules, links, console errors, bundle budgets, and Lighthouse.
- Exercised browser-app empty, sample-conflict, invalid remote endpoint, recovery, persistence, removal, and unavailable native-picker paths.
- Compared 12 deployed files to the local candidate build; all SHA-256 values matched.
- Inspected GitHub release state and downloaded/checksummed/launched the currently published Linux artifact.

## Release blockers

1. `v0.1.1` release run `33297898822` failed in the Windows `npm test` step; finalization was skipped. Only `v0.1.0` is published, so the live `v0.1.1` site installs old binaries.
2. `.factory/claims.json` omits core behavior/privacy/installer promises, and its download test accepts the generic release fallback instead of asserting the intercepted artifact URL.
3. The deployed 404 is unstyled and produces four console/CSP errors because it requests missing `/site.css`.
4. The 390 px landing page clips content at 200% zoom (`scrollWidth` 706 px).

Medium findings are undersized touch targets, the missing three-to-five-frame desktop walkthrough, and an incomplete landing-copy audit.

## Passing controls

- First-read/demo gate passes.
- Normal 390 px layouts have no overflow; normal public routes have no serious/critical axe findings.
- Visible keyboard focus, dialog focus/Escape, and reduced motion pass.
- Demo requests are same-origin only; landing requests only the disclosed GitHub release API; there are no cookies or analytics.
- Security headers and immutable hashed-asset caching pass.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, TBT 0 ms, CLS 0.003.
- Site JS/CSS/hero and desktop JS/CSS are within budget.

## Reproduce

```sh
npm ci
npm run check
npm run test:e2e
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

The native Rust commands need the Linux packages listed in `.github/workflows/ci.yml`. No product code was changed during verification.

## Next steps

1. Fix the cross-platform release test and publish complete `v0.1.1` assets plus `latest.json` and `SHA256SUMS`.
2. Add claim entries and outcome-level sandbox tests for every public behavior, privacy, and installer promise; make the release test require the exact mocked asset URL.
3. Route the 404 through the built stylesheet without inline CSP violations and test its console.
4. Make the landing page reflow without horizontal scrolling at 200% zoom and bring all click targets to at least 44×44 CSS px.
5. Complete the required screenshot walkthrough and full-sentence copy audit, then run independent verification again.
