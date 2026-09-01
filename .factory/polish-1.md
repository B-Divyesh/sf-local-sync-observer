# Polish round 1 — finding closure

Base review: `.factory/review-1.md` at `57f2494`. Repair base: `b00dc26`. Live check: 2026-09-01 at `https://local-sync-observer.sociobot.in`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Extracted scan and endpoint checks into dependency-free `crates/observer-core`; the Tauri app imports the same code. | Clean clone `/tmp/lso-clean-UclbMG`; all three exact `cargo test --manifest-path crates/observer-core/Cargo.toml …` claim commands passed. |
| F-1-2 | Removed untestable two-minute, named-provider, signing, and blanket-checksum promises. Added the `release-fallback` claim and test; expanded local-storage claim to cover the disclosed unencrypted storage behavior. | All 16 `.factory/claims.json` commands passed from the clean clone; `/tmp/lso-claim-release-fallback.log`, `/tmp/lso-claim-local-app-storage.log`, and `.factory/claims.json`. |
| F-1-3 | Added title, description, canonical, icon, Apple touch, Open Graph, and Twitter metadata to demo, privacy, terms, and 404. | `public routes use complete metadata, shared navigation, and route-heading focus` Playwright test; cold live markup checks for `/demo/`, `/privacy/`, `/terms/`, and `/does-not-exist`. |
| F-1-4 | Replaced route-specific navigation with one header (Demo, How it works, Privacy, Download) and one footer (Privacy, Terms, Source, factory/version line). | Same route-shell Playwright test; cold live `/does-not-exist` confirms the recovery navigation. |
| F-1-5 | Replaced mood headings and ambiguous control text with descriptive section names and **View install options**. | `site/index.html`; cold live home screenshot `.factory/verification-evidence/polish-1-live-home.png`. |
| F-1-6 | Added shared route-load script that focuses each `h1` and announces it; 404 has the same shell, metadata, recovery links, and no missing/CSP subresources. | Local exact-404 test `unknown-page artifact is styled, focuses its recovery heading, and logs no browser errors`; cold live screenshot `.factory/verification-evidence/polish-1-live-404.png`; live HTTP status remains 404. Chromium emits its built-in document-status warning for this true 404, but no product script, style, CSP, or subresource error remains. |
| F-1-7 | Rewrote README opening, release fallback, and key-storage copy into short plain sentences. Updated the full copy inventory and terminology table. | `.factory/copy-audit.md`; `rg` audit found no old reviewed wording in current landing or README. |

## Additional controller findings

- Claim commands are reproducible without undeclared native packages: the pure Rust crate has only the standard library.
- Material claims are registered or removed; `release-fallback` closes the previously missing GitHub outage behavior.
- Route metadata, navigation, first-screen labels, 404 focus, and README sentence length are covered by source and browser tests.
- Catalog copy is verb-first, 77 characters, and stored in `.factory/catalog-description.txt`.

## Final checks

- `npm run check`: pass.
- `npm run test:e2e`: pass, 38 tests.
- Native Linux checks: pass after CI-declared Tauri packages.
- Clean-clone claim suite: pass, 16/16 commands.
- Cold live 390 px Axe: 0 serious/critical violations on all public routes.
