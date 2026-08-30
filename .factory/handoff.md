# Local Sync Observer — repair handoff

## Repair scope

This repairs the independent-verifier report at commit `a622a8b4c7d36ed998c0792eee0e43b52518d92d` for candidate `1313d781ab40a7b3fe4c950a080a2163321ce925`.

- Added `.factory/claims.json`, exact tagged Playwright claim coverage, `.factory/demo.md`, and the required copy audit.
- Added `/demo/`, a one-click realistic conflict sample, a persistent reset/start banner, a `demo:` browser-storage namespace, and a service-worker offline reload path. The desktop app’s sample now uses its own `demo:local-sync-observer.v1` namespace, does not refresh against a provider, can reset, and discards itself before real setup.
- Replaced the browser’s GitHub redirect download-manifest fetch with CORS-safe `https://api.github.com/repos/B-Divyesh/sf-local-sync-observer/releases/latest`, one-hour local caching, correct platform asset matching, and a calm release-page fallback.
- Fixed the released-dialog root cause with `[hidden] { display: none !important; }`, plus `aria-hidden` state. The inactive folder controls and its native picker are no longer visible or operable under Syncthing.
- Fixed mobile legal-page link names and 44 px brand/footer targets.
- Added canonical/social/Twitter/favicon/apple-touch metadata, a versioned footer, `/404.html`, `robots.txt`, `sitemap.xml`, and Static Web Apps CSP/frame, response-override, and immutable asset-cache configuration.
- Bumped the desktop release version to `0.1.1`; the existing GitHub Actions matrix remains the packaging authority for macOS, Windows, and Linux artifacts.

## Verification

Run from a clean checkout:

```sh
npm ci
npm run check
npm run test:e2e
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Completed in this repair environment:

- `npm ci`: passed, 0 vulnerabilities.
- `npm run check`: passed. TypeScript, 6 unit/static-contract tests, and both production builds passed. `dist/app` and `dist/site` were produced.
- `npm run test:e2e`: passed, 20/20 across desktop and exact 390 px mobile. This includes axe serious/critical checks on the landing, app, privacy, and terms pages; keyboard dialog checks; no-console-error release API resolution; the hidden source-form regression; the isolated-demo/reset/privacy/offline claim tests; and no mobile horizontal overflow.
- Claim commands in `.factory/claims.json` each pass independently; the offline claim uses its own `browser.newContext()` and closes only that context.
- After installing the CI-declared Linux WebKit dependencies in this disposable worker, `cargo fmt --check`, `cargo test` (3/3), and `cargo clippy --all-targets -- -D warnings` all passed.

## Deployment and release

- Static deployment output remains `dist/site` from `npm run build:site`; it contains `staticwebapp.config.json` with the required CSP (`connect-src` includes `https://api.github.com`), frame restriction, 404 rewrite, and immutable `/assets/*` caching.
- Deployed on 2026-08-30 with `/opt/fleet/lib/deploy-static.sh local-sync-observer /work/repo/dist/site` (deployment `341ca07e-86f2-410c-b793-8f271dd80a53`). Live `/demo/` returns the new 1,729-byte page with CSP/frame restriction; a hashed JS asset returns `Cache-Control: public, max-age=31536000, immutable`; an unknown path returns HTTP 404.
- Pushed repair commit `b05da6b` and tag `v0.1.1`. Hosted release run `33297898822` is the GitHub Actions package/release run; it builds the required DMG/MSI/EXE/AppImage/DEB matrix and publishes `SHA256SUMS` plus `latest.json`. Builds remain unsigned.

## Known limits / operator action

- Syncthing remains the only provider that can establish provider-backed convergence. Folder observation is deliberately metadata-only and remains `Unknown` without provider evidence.
- API keys are stored in local WebView storage and are not application-level encrypted; use a dedicated/revocable key.
- The `v0.1.1` release needs the normal hosted GitHub Actions run to produce platform binaries. macOS and Windows signing still need owner-provided certificates (`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`) if signing is desired.
