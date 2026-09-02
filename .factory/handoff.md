# Local Sync Observer — repair handoff

## Outcome

Local repair verification is **PASS** for v0.1.7. This repair addresses every
release-blocking finding in independent verification 8 for candidate
`2d4d8383cb2de8a96ff3a42e82938db10dd0509b`. The release tag, GitHub package
build, and static deployment are published after this handoff commit; their
live evidence is appended below before final delivery.

## Repairs

1. **Android and iPhone download handoff.** The landing page now detects
   Android, iPhone, iPad, and iPod before desktop operating systems. It does
   not request a GitHub release or offer a Linux download on those devices.
   It instead explains that the desktop app runs on macOS, Windows, and Linux
   and asks the visitor to open the site on a computer.
2. **IPv6 loopback setup.** The desktop URL validator removes the brackets
   returned by the browser URL parser before comparing the hostname. It now
   accepts `http://[::1]:8384`, matching the Rust core's local-endpoint rule.
3. **390 px home target.** The LS/O brand mark is 48 × 44 CSS px and its
   accessible name identifies the product.
4. **200% desktop reflow.** The app no longer imposes a 320 px minimum width.
   At a 195 px CSS viewport its header, source list, actions, and dialog stack
   without clipping or horizontal overflow.

## Regression coverage

- `@claim:mobile-desktop-handoff` opens fresh Android and iPhone contexts,
  checks the explicit handoff, confirms no download action is visible, and
  records that no GitHub API request is made.
- `@claim:local-endpoint-only` now checks the Rust IPv4, IPv6, localhost, and
  `.local` rules and drives the desktop setup form with `[::1]`, asserting the
  provider probe receives the endpoint.
- The desktop browser suite checks every visible interactive target and
  clipping at 195 px, including the LS/O brand name and its 44 px target.

## Verification run locally

All commands below completed after a clean `npm ci` (67 packages; 0 reported
vulnerabilities):

```sh
npm run audit:copy:check
npm run check
npm run test:e2e
npm run test:claim:local-endpoint
cargo fmt --manifest-path crates/observer-core/Cargo.toml -- --check
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo clippy --manifest-path crates/observer-core/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Results:

- TypeScript, copy audit, Vitest: 14/14, and production app/site build passed.
- Playwright: 53 passed; 3 desktop-release assertions are intentionally skipped
  only in the Android-emulation project. Desktop and iPhone contexts exercise
  the repaired handoff. The app suite includes 200% reflow and keyboard paths.
- All 26 exact commands in `.factory/claims.json` passed from the clean
  install. This includes demo isolation, offline reload/update, same-origin
  privacy, local-only sources, release fallback/cache, and the two new claims.
- Observer core: 9/9 tests passed; strict Clippy passed. Tauri format, test,
  and strict Clippy passed after installing the Linux WebKit/GTK development
  packages used by the release workflow.
- Playwright Axe checks cover desktop/mobile app, site, legal routes, and the
  repaired states with no serious or critical findings. The local URL verifier
  passed at `http://127.0.0.1:4173/`: HTTP 200, 655 ms load, no page errors,
  `lang=en`, one h1, main landmark, and no missing image alt text.
- Current build output: app JS 23.17 KB (7.91 KB gzip), app CSS 11.79 KB
  (3.21 KB gzip), site JS 2.61 KB (1.26 KB gzip), and site CSS 12.56 KB
  (3.23 KB gzip). These are within the static-product budgets.

The final `npm run build` is rerun after the handoff commit so the app embeds
the exact shipped source revision.

## How to run

```sh
npm ci
npm run dev
npm run dev:site
npm test
npm run test:e2e
npm run build
```

Desktop release packages are built by `.github/workflows/release.yml` from a
`v*` tag. The landing site is built to `dist/site`; the Tauri app is built to
`dist/app`.

## Privacy and known operator action

The observer stays local-first: no telemetry is included, the sample demo uses
its own storage namespace, and production source URLs are limited to loopback
or `.local` hosts. Desktop packages are intentionally unsigned. macOS
notarization and Windows Authenticode require operator-owned certificates;
the workflow's documented certificate secrets remain the only required
operator action.
