# Independent product verification — PASS

- Date: 2026-09-01 UTC
- Candidate: `0afba5905f284fa62451a63328b344b3f6e450e3`
- Live URL: `https://local-sync-observer.sociobot.in`
- Work order: `local-sync-observer-verify-3`
- Result: **PASS**

## Decision

The candidate meets the researched brief: it is a local, read-only observer that shows evidence-backed pending/conflict/convergence state, deliberately preserves `Unknown` where folder metadata cannot prove convergence, and hands users back to the owning tool rather than changing files. All 15 registered claims passed from the supplied sample-data entry points after the clean dependency install. The live static deployment is byte-identical to this candidate's production site build.

There are no open product defects by severity.

## Mandatory first read and demo

Cold desktop load of `/` clearly answered all three required questions:

- **What it does:** “Check what synced after offline work.” It names pending files, conflicts, and device status.
- **For whom:** people using Syncthing after offline work.
- **What to click first:** the visible first-screen **Try it with sample data** link.

That single action opens `/demo`. At 390 px it immediately shows a realistic `Field notes` conflict, the persistent “Demo — sample data, nothing is saved to your real observer” notice, **Reset demo**, and **Start for real**. Reset preserved the sample conflict and the controls remained keyboard reachable.

## Clean checkout, claims, and build

- `HEAD` is exactly `0afba5905f284fa62451a63328b344b3f6e450e3`; checkout was clean before this report update.
- `npm ci`: passed (67 packages, audit: 0 vulnerabilities).
- Every exact command from `.factory/claims.json`: **PASS**. This covers release download selection/matrix, checksum installer behavior, metadata-only scanning, scan bounds, local-only endpoints, local application storage, owning-tool handoff, 30-second refresh, privacy, MIT license, isolated demo, demo request privacy, and offline demo reload.
- `npm run check`: **PASS** — TypeScript, all 10 Vitest tests, and production `dist/app` plus `dist/site` builds.
- `npm run test:e2e`: **PASS, 34/34** across desktop Chromium and 390 px mobile. The suite includes normal sample conflict, dialog/keyboard behavior, an invalid remote endpoint and recovery, source refresh, storage isolation, offline reload, legal routes, 404, 200% reflow, and app/site axe checks.
- `cargo test --manifest-path src-tauri/Cargo.toml`: **PASS, 5/5**.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: **PASS**.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: **PASS**.
- `npm run build`: **PASS**. The initial site JS is 2,729 bytes (1,300 gzip); CSS is 11,980 bytes (3,070 gzip), within the stated budgets.

The native `tauri build` compiled the release binary and produced Debian and RPM bundles. It cannot complete its AppImage packaging in this disposable container because Tauri's downloaded `linuxdeploy` AppImage requires a FUSE device; direct invocation reported `fuse: device not found`. This is an environment limitation, not a source failure: the published `v0.1.2` AppImage exists, and the same release also provides both macOS DMGs and Windows MSI/EXE. The supplied `CI=1` environment additionally needs `CI=true` because Tauri's CLI accepts Boolean words rather than `1`.

## Live deployment, release, and installer evidence

- Fresh SHA-256 comparisons of local `dist/site/index.html`, `/demo`, hashed JS, and hashed CSS against the live URL were exact matches.
- The release manifest is `v0.1.2`. Its recorded source commit is `39df651917f50f887a25123575d7f9d82c2e6a21`; `git diff` to this candidate changes only `.factory/handoff.md`, so the shipped product code is identical.
- The release exposes macOS arm64/x64 DMGs, Windows x64 MSI/EXE, and Linux AppImage/DEB. A freshly downloaded `Local.Sync.Observer_0.1.2_amd64.deb` passed `sha256sum -c SHA256SUMS`.
- `/` and `/demo` returned 200; an unknown route returned 404. Hashed assets use `public, max-age=31536000, immutable`; HTML uses no-cache or short revalidation.
- No product server endpoint or product-unlock endpoint exists, so server rate-limit and persistence/concurrency checks do not apply. There is no sign-in flow.

## Accessibility, privacy, and browser QA

- Fresh Playwright axe scans on live desktop `/` and 390 px `/demo`: **0 serious or critical findings**. The full local suite also covers app, privacy, terms, and 404 routes.
- Keyboard-only traversal reaches the skip link first and then header, demo, and download controls. Live focused controls display a 4 px `rgb(6, 69, 209)` outline. Reduced-motion emulation matched and found zero active animations.
- Live desktop and 390 px mobile pages had zero console/page errors. The first screen has one `h1`, title, language, main landmark, alternatives for images, responsive 44 px controls, and no observed overflow.
- Landing request log: same-origin assets plus the disclosed `https://api.github.com/.../releases/latest` request for download metadata. Demo request log: same-origin only. No analytics, cookies, CDN fonts, account, or payment requests were observed.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and a header CSP with `frame-ancestors 'none'`; `connect-src` permits only self and the documented GitHub API.
- Lighthouse's generated mobile JSON reported Performance **99** and Accessibility **100** (LCP 1.739 s, CLS 0.004). The CLI returned non-zero after writing the report because its Chromium tab later crashed during final cleanup, so this is corroborating rather than gating evidence.

## Notes

- The standalone axe CLI could not start Chrome in this container. Playwright's installed axe integration ran successfully and was used for the live scan above.
- The observer intentionally supports provider-backed convergence for Syncthing only; local folder metadata remains `Unknown`, which is consistent with the brief's honesty requirement.

## Final result

**PASS — candidate `0afba5905f284fa62451a63328b344b3f6e450e3` is acceptable for release.**
