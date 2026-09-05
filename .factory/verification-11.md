# Verify local sync status after offline work — PASS

- Work order: `local-sync-observer-verify-11`
- Verified: 2026-09-05 UTC
- Live URL: <https://local-sync-observer.sociobot.in>
- Implementation candidate: `b71a731fe732d2af7c4082908a70100bf4011883` (`v0.1.9`)
- Documentation at verification start: `b71a731fe732d2af7c4082908a70100bf4011883` (same candidate; this report is a docs-only handoff addition)
- Verdict: **PASS**
- Findings: **0**
- Untested public claims: **0**

## Product and first action

Local Sync Observer is a read-only desktop app for people using Syncthing or
Nextcloud who need pending work, conflicts, and connection status in one
place. It does not sync or alter files.

Fresh desktop (1440 x 900) and iPhone 13 contexts both showed, before
scrolling:

- Job: **Check what synced after offline work.**
- Audience: people using Syncthing or Nextcloud who need pending work,
  conflicts, and connection status in one place.
- First action: **Try it with sample data**; it opens a sample conflict board
  and saves nothing.

The action opened `/demo/?demo=1`. The populated board showed the Field notes
Syncthing conflict and Shared research Nextcloud pending activity. Its
persistent **Demo — sample data, nothing is saved to your real observer**
notice remained present. **Reset demo** retained the sample and left the real
`local-sync-observer.v1` storage key absent. Fresh demo traffic used only the
product origin, and no console or page error occurred.

## Clean checkout and claims

The checkout began clean at the candidate. I ran `npm ci --include=dev` (67
packages, zero reported vulnerabilities) and installed the Linux Tauri
packages declared by CI before native tests.

| Check | Result |
| --- | --- |
| `npm run audit:copy:check` | Pass |
| `npm run check` | Pass: TypeScript, 15 Vitest tests, `dist/app`, `dist/site` |
| `cargo test --manifest-path crates/observer-core/Cargo.toml` | Pass: 9 tests |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Pass |
| strict core and Tauri Clippy | Pass |
| `npm run test:e2e` | Pass: 54 passed, 4 intentional platform skips |

All 26 unique exact commands declared by `.factory/claims.json` were run
separately after installation. Every command passed. This includes the
browser, Vitest, and Rust claims for release identity, checksums, privacy,
offline demo reload, demo isolation, local-only endpoints, read-only probing,
provider evidence, scan bounds, tray redaction, and mobile handoff. There are
no missing, false, incomplete, or untested public claims found in the live
site, README, or legal pages.

## Live product checks

- Live `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200. The designed
  unknown route returned HTTP 404, had a working recovery path, route-specific
  title, focused `h1`, and no accessibility issue. The document-load 404 is
  expected, not a defect.
- Fresh request logs found landing traffic only to the product origin and the
  disclosed `https://api.github.com`; the demo used only the product origin.
  No cookies, analytics, or console/page errors were observed.
- A fresh iPhone context visited `/demo/?demo=1`, waited for the service
  worker, went offline, reloaded, and retained the sample conflict and demo
  banner without errors.
- Keyboard focus was visible (`solid` outline); reduced-motion emulation
  reduced the hero transition to `0.00001s`. The landing page had no desktop
  horizontal overflow.
- Playwright Axe scans of `/`, `/demo/`, `/privacy/`, `/terms/`, and the 404
  page at desktop and iPhone widths reported zero violations, including zero
  serious or critical issues. The standalone Axe CLI could not locate a system
  Chrome binary in this container, so the permitted Playwright Axe integration
  was used instead.
- The repository does not contain `verify-url.sh`; as in verification 4, I
  independently checked its stated title, `lang`, single `h1`, main landmark,
  alt/label, and console-error conditions with fresh Playwright contexts.
  They passed.
- All discovered internal links returned 200 except the intentional 404-page
  skip link, which correctly returned 404. GitHub repository, issue, release,
  and three current detected-platform artifact links returned 200.
- Live headers include HSTS, `nosniff`, strict referrer policy, a restrictive
  CSP with only the disclosed GitHub API connection origin, and
  `frame-ancestors 'none'` as a response header.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.4 s, TBT 90 ms, CLS 0, 182 KiB transfer.

## Release and installed artifact

GitHub Release `v0.1.9`, its tag, the live site bundle, and `latest.json` all
identify `b71a731fe732d2af7c4082908a70100bf4011883`. `latest.json` has the
required macOS arm64/x64, Windows x64, and Linux x64 entries and all six
artifacts carry that commit. `SHA256SUMS` contains each release asset.

I downloaded `Local.Sync.Observer_0.1.9_amd64.deb`; its SHA-256 matched the
published manifest. In a clean Xvfb/DBus consumer session it installed as
`local-sync-observer 0.1.9 amd64` and stayed running for the 12-second launch
smoke test. The timeout was deliberate. Portal/FUSE warnings came from the
disposable headless container, not an app crash.

## Earlier findings

Every earlier review and verification finding is closed:

| Earlier issue | Current disposition |
| --- | --- |
| Clean Rust claims could not start | CI Linux prerequisites installed; core and Tauri tests pass. |
| Missing/weak claims, privacy proof, demo proof, installer proof | 26 registered claims; each exact command passes. |
| Metadata, navigation, plain wording, external-link labels, copy audit | Current pages have route metadata, consistent navigation, descriptive controls, external labels, and passing audit. |
| 404 errors/focus and browser history | 404 is designed and focused; full browser suite passes navigation restoration. |
| Mobile first-screen, touch, and 200% reflow regressions | Current phone suite passes, with truthful desktop-only handoff. |
| IPv6 local endpoint and no-probe-before-save | Desktop claim tests pass at both project widths. |
| Nextcloud coverage gap | The demo and core claim now cover a Nextcloud desktop-log pending reading. |
| Older package set advertised by newer site (verification 4 and 10) | Live website, tag, release API, manifest, checksum, and installed Debian package all identify `b71a731`. |

## Scope notes

This static desktop/site product has no product backend tenant, health,
restart-persistence, or rate-limited API path. Those backend checks are not
applicable. The remaining documented limitation is that installers are
unsigned pending owner certificates; the live site states the desktop-only
handoff and no signing claim was made.

## Final verdict

**PASS.** There are zero findings at every severity and zero untested public
claims for implementation candidate `b71a731fe732d2af7c4082908a70100bf4011883`.
