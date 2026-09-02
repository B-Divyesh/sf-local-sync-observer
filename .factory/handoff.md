# Local Sync Observer — handoff

## Outcome

Perfection-loop round 4 is complete. The repository, desktop product, static
site, isolated demo, release downloads, and claim registry have no unresolved
review finding.

Repair commit `42d96d3a4ec70bbc28e2f86415cb07d06e92750a` adds the exact
`mixed-provider-demo` and `checks-require-source` claims and tagged tests. The
first proves the visible Syncthing conflict-copy and Nextcloud pending-log
sample. The second proves that a fresh desktop app sends no provider probe
until the user saves a local source.

The catalog description is verb-first and 83 characters:

> Check Syncthing and Nextcloud after offline work without opening or changing files.

## Run and verify

```sh
npm ci --include=dev
npm run audit:copy:check
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
cargo fmt --manifest-path crates/observer-core/Cargo.toml -- --check
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Final results: copy audit passed; Vitest passed 14/14; Playwright passed 50/50;
core Rust passed 9/9; both builds, Tauri tests, Rust formatting, and clippy
passed. All 25 exact commands in `.factory/claims.json` also passed
independently from clean remote clone
`/tmp/lso-polish4-clean.T97Wn2/repo`. The per-claim summary is
`.factory/polish-4-evidence/clean-claims-summary.txt`.

The browser suite covers desktop and 390 px layouts, keyboard dialog focus,
200% reflow, 44 px controls, route focus and metadata, 404 handling, serious
and critical Axe findings, request boundaries, storage isolation, and offline
demo reload.

## Build and deploy

```sh
npm run build:site
/opt/fleet/lib/deploy-static.sh local-sync-observer /work/repo/dist/site
```

The static site was deployed as Azure deployment
`4c937ef9-e2f2-47ea-8bd5-b8dff7f838fc` and is live at
<https://local-sync-observer.sociobot.in/>. `verify-url.sh` returned HTTP 200
with no console errors. A fresh live browser check confirmed:

- the complete first screen fits at 390 × 844 and 1440 × 900;
- `/?demo=1` reaches the isolated mixed-provider board in one click;
- the demo uses only its `demo:` namespace and makes same-origin requests;
- reset preserves the real-data sentinel and exit removes the demo key;
- the sample reloads offline;
- home, demo, privacy, terms, and 404 have route titles, metadata, one h1, one
  main landmark, focused headings, and zero serious/critical Axe results;
- `/does-not-exist` returns the designed HTTP 404;
- GitHub exposes the v0.1.6 macOS arm64/Intel, Windows, Linux, checksum, and
  manifest assets.

Evidence is in `.factory/polish-4-evidence/`. Lighthouse 13.4.1 desktop scored
100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO, with
333 ms LCP, 0 CLS, and 0 ms TBT. The deployed JS is 1.71 KB gzip and CSS is
3.21 KB gzip; the desktop UI JS is 8.41 KB gzip and CSS is 3.09 KB gzip.

## Desktop release

Release `v0.1.6` remains the current desktop release because round 4 changes
only the claim registry, tests, and catalog copy; it does not change desktop
runtime code. Its `latest.json` lists six packages and identifies source commit
`975d41d47926f5981af923e47cf82d32aca7074e`. A fresh download of
`Local.Sync.Observer_0.1.6_amd64.deb` matched the published SHA-256
`10f562814591ad9bc8214c164cd9114eff6532c3f82fd0711adca7efa440afe4`.

GitHub quality-gates run
[33585301112](https://github.com/B-Divyesh/sf-local-sync-observer/actions/runs/33585301112)
passed for the repair commit.

## Known gaps and operator action

No functional or review gap remains. Current desktop packages are unsigned,
as disclosed in the release. The workflow does not currently consume signing
secrets, so no signing secret is required for this handoff. Signing a future
release would require operator-owned Apple notarization and Windows
Authenticode configuration.
