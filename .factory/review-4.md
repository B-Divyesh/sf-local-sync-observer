# Adversarial first-read review 4 — Local Sync Observer

- Date: 2026-09-02 UTC
- Reviewed base: `96f0a80470497abe684d9dc11066951bb98c928e`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Context: new Chromium contexts at 390 × 844 and 1440 × 900; no prior cookies or storage
- Verdict: **FAIL**

`PASS` requires no findings. One unlisted live claim remains.

## First screen

Before scrolling, both fresh contexts answered the required questions.

| Question | Cold-visit answer |
| --- | --- |
| What does it do? | It checks what finished syncing after offline work and reports pending work, conflicts, and connection status. |
| For whom? | People using Syncthing or Nextcloud who need those statuses in one place. |
| What should I click first? | **Try it with sample data**. It says it will open a sample conflict board and save nothing. |

At 390 px, the headline, audience sentence, primary action, action result, download action, and all three facts appear without scrolling. There was no horizontal overflow or console error. The cold landing made only same-origin requests plus the disclosed `api.github.com` release request; no cookies were set.

## Findings

### F-4-1 — MEDIUM — three factual demo statements have no registered claim

**Location:** live `/demo/?demo=1`, demo note.

**Exact copy:** “The Syncthing sample has a conflict-copy filename. The Nextcloud sample has a desktop-log message that work is still pending. The desktop app checks a sync tool only after you add a local source.”

**Check:** none of the 23 entries in `.factory/claims.json` names these promises. The nearest entry, `isolated-demo`, proves the banner, a conflict, namespace isolation, reset, and exit. Its tagged test does not assert the Nextcloud row, either explanatory sentence, or that a fresh desktop app makes no provider check before a source is added. The separate `one-click demo shows isolated mixed-provider sample data` and desktop empty-state tests are untagged, so they are not claim tests listed in the registry.

**Why this matters:** a visitor uses this note to understand what the one-click demo proves and when the installed app contacts a configured source. The current registry cannot prove all of that relied-on behavior from the clean sandbox.

**Concrete fix:** either delete the three explanatory claims, or add two entries: `mixed-provider-demo` should assert the visible Syncthing conflict-copy and Nextcloud pending-log sample; `checks-require-source` should instrument a fresh desktop shell and assert no provider probe occurs until **Save and inspect**. Tag each test `@claim:<id>`, list its exact command in `claims.json`, and name the corresponding demo-copy locations.

## Copy audit

Word counts below are whitespace-separated, with a URL or hyphenated compound counted as one word. No sentence exceeds 22 words. No landing or README sentence uses a banned marketing adjective. The F-4-1 sentences are flagged above as unlisted claims; no other wording flag was found.

### Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | Check what synced after offline work. | — |
| 2 | 17 | For people using Syncthing or Nextcloud who need pending work, conflicts, and connection status in one place. | — |
| 3 | 8 | Opens a sample conflict board; nothing is saved. | — |
| 4 | 6 | Choose a build for your computer. | — |
| 5 | 9 | The observer checks sync status without handling your files. | — |
| 6 | 9 | After reconnecting, “idle” may not mean every device agrees. | — |
| 7 | 11 | The observer combines Syncthing status, Nextcloud desktop logs, and conflict-copy names. | — |
| 8 | 9 | Add Syncthing, a Nextcloud desktop log, or a folder. | — |
| 9 | 9 | Credentials and paths stay in the app’s local storage. | — |
| 10 | 17 | See pending activity, conflicts, the last completed sync, and any details your sync tool did not report. | — |
| 11 | 8 | Open the affected sync tool from its row. | — |
| 12 | 11 | The observer uses read-only checks and does not change your files. | — |
| 13 | 12 | If a check cannot show that syncing finished, the board says so. | — |
| 14 | 10 | Every status lists its checks and any missing Syncthing details. | — |
| 15 | 8 | Reads Syncthing’s local folder list and pending-file count. | — |
| 16 | 8 | It also checks folder names for conflict copies. | — |
| 17 | 13 | Reads its local log for conflicts, connection problems, pending activity, and completed syncs. | — |
| 18 | 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. | — |
| 19 | 4 | Never opens file content. | — |
| 20 | 7 | Choose a build for your operating system. | — |
| 21 | 6 | Apple silicon and Intel disk images. | — |
| 22 | 3 | 64-bit Windows installer. | — |
| 23 | 4 | AppImage and Debian package. | — |
| 24 | 13 | The macOS and Linux shell installer checks the downloaded file before opening it. | — |
| 25 | 13 | The empty board waits for a local source before it reports a status. | — |
| 26 | 11 | Add Syncthing, choose a Nextcloud desktop log, or choose a folder. | — |
| 27 | 11 | The board shows the conflict and lists the checks it used. | — |
| 28 | 8 | A folder check can find common conflict copies. | — |
| 29 | 7 | Only Syncthing’s pending count can establish “Converged.” | — |
| 30 | 4 | Downloads are being published. | Runtime fallback; clear. |
| 31 | 4 | Open releases on GitHub. | Runtime fallback; clear. |

Headings name their sections: **Why one sync reading helps**, **How the observer checks a source**, **Sample conflict walkthrough**, **When the reading is unknown**, **Provider coverage and limits**, and **Install Local Sync Observer**. Controls use result-naming verbs, including **Try it with sample data**, **View install options**, and platform-specific downloads. The terminology is consistent: `reading`, `source`, `sync tool`, `demo`, `sample data`, `unknown`, and `converged`.

### README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 10 | Local Sync Observer checks Syncthing and Nextcloud after offline work. | — |
| 2 | 9 | It shows whether your folders and devices finished syncing. | — |
| 3 | 9 | It observes sync status and does not sync files. | — |
| 4 | 11 | It reads Syncthing status, Nextcloud desktop logs, and selected folder metadata. | — |
| 5 | 10 | It never opens synced file contents or changes a file. | — |
| 6 | 12 | When something needs attention, it opens the sync tool for the fix. | — |
| 7 | 7 | Try the isolated demo before installing: https://local-sync-observer.sociobot.in/?demo=1. | — |
| 8 | 10 | The demo keeps sample data separate from your saved settings. | — |
| 9 | 8 | It never reads or changes real observer data. | — |
| 10 | 10 | Download the build for your operating system from the website. | — |
| 11 | 8 | The shell installer fetches the release file list. | — |
| 12 | 7 | It checks the download before opening it. | — |
| 13 | 7 | See releases on GitHub for install details. | — |
| 14 | 3 | Open **Configure sources**. | — |
| 15 | 10 | Choose Syncthing and enter its local address and API key. | — |
| 16 | 11 | You can also choose a Nextcloud desktop log or folder check. | — |
| 17 | 4 | Select **Save and inspect**. | — |
| 18 | 9 | The board checks again every 30 seconds while running. | — |
| 19 | 4 | Review the listed checks. | — |
| 20 | 9 | Use **Open sync tool** to resolve a finding there. | — |
| 21 | 8 | The tray tooltip shows the current overall reading. | — |
| 22 | 6 | It never includes filenames or paths. | — |
| 23 | 12 | Use Syncthing on this computer, such as http://127.0.0.1:8384, or a .local address. | — |
| 24 | 7 | Nextcloud checks read its local desktop log. | — |
| 25 | 10 | They show conflicts, connection problems, pending activity, and completed syncs. | — |
| 26 | 9 | The log does not provide a reliable pending-file count. | — |
| 27 | 14 | Folder checks inspect names and metadata for at most 50,000 entries and 16 levels. | — |
| 28 | 6 | They can flag common conflict copies. | — |
| 29 | 13 | They do not show that syncing finished unless Syncthing reports no files waiting. | — |
| 30 | 8 | Prerequisites: Node.js 22, npm, and current stable Rust. | Developer context. |
| 31 | 12 | Tauri development also needs the Tauri 2 system dependencies on its website. | Developer context. |
| 32 | 8 | npm run build builds both dist/app and dist/site. | Developer context. |
| 33 | 10 | The release workflow runs on v* tags and manual dispatch. | Developer context. |
| 34 | 7 | It builds macOS, Windows, and Linux packages. | — |
| 35 | 10 | It publishes SHA256SUMS and latest.json with the tagged source commit. | — |
| 36 | 7 | The one-click demo is documented in .factory/demo.md. | — |
| 37 | 11 | Its observable product promises and exact test commands are in .factory/claims.json. | — |
| 38 | 9 | The landing page asks GitHub which release is current. | — |
| 39 | 10 | If GitHub is unavailable, it links to the release page. | — |
| 40 | 15 | Source labels, paths, local addresses, API keys, and readings stay in the app’s local storage. | — |
| 41 | 6 | API keys stay on this device. | — |
| 42 | 6 | Version 0.1 does not encrypt them. | — |
| 43 | 5 | Use a separate Syncthing key. | Instruction. |
| 44 | 9 | Remove the source when you no longer need it. | Instruction. |
| 45 | 7 | The website has no analytics or cookies. | — |
| 46 | 9 | It removes cached GitHub release details after one hour. | — |
| 47 | 4 | See Privacy and Terms. | — |
| 48 | 5 | Licensed under the MIT License. | — |

The checked generated inventory in `.factory/copy-audit.md` matches the current source, including the headline, annotation, runtime variants, README demo URL, and terminology table.

## Demo and sandbox

The required demo path works, apart from F-4-1’s registry gap.

- **Try it with sample data** reaches `/demo/?demo=1` in one click. The first screen already shows a realistic `Field notes` conflict and `Shared research` pending state.
- The persistent banner says **“Demo — sample data, nothing is saved to your real observer.”** It provides **Reset demo** and **Choose a download**.
- A real namespace sentinel, `local-sync-observer.v1 = real-sentinel`, remained byte-for-byte unchanged through entry and reset. The page used only `demo:local-sync-observer.site.v1`; leaving demo removed that key and retained the sentinel.
- A fresh demo-only request log contained product-origin resources only. The GitHub request observed in the broader manual log occurred only after choosing the landing download section.
- In its own browser context, after the first visit and service-worker control, offline reload retained **“Syncthing conflict plus Nextcloud pending activity.”**

## Claims

Every exact command in `.factory/claims.json` was run independently from this clean checkout after `npm ci --include=dev`. All 23 passed; the per-command output is retained in `/tmp/lso-review4-claims.log` for this review container.

| Claim ID | Result |
| --- | --- |
| release-downloads | PASS |
| release-matrix | PASS |
| checksum-install | PASS |
| evidence-boundary | PASS |
| metadata-only-scan | PASS |
| scan-bounds | PASS |
| local-endpoint-only | PASS |
| local-app-storage | PASS |
| open-owner | PASS |
| thirty-second-refresh | PASS |
| site-private | PASS |
| mit-license | PASS |
| isolated-demo | PASS |
| demo-private | PASS |
| offline-demo-reload | PASS |
| release-fallback | PASS |
| syncthing-reading | PASS |
| reading-details | PASS |
| read-only-probe | PASS |
| tray-status | PASS |
| no-product-account | PASS |
| release-cache-retention | PASS |
| nextcloud-desktop-log | PASS |

The claims gate nevertheless fails because F-4-1 identifies three claim-like demo sentences without a registry entry and tagged sandbox test.

## Earlier-finding verification

Every earlier review and polish record was read. The live site and current code confirm the following closures; no earlier ID is reopened.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Fixed. The formerly blocked pure checks run in dependency-free `crates/observer-core`; all three exact commands pass. |
| F-1-2 | Fixed for its listed public claims. The removed release/signing assertions remain absent; registered replacement checks pass. |
| F-1-3 | Fixed. Home, demo, privacy, terms, and 404 each expose route-specific title, description, canonical, OG/Twitter data, favicon, and Apple touch icon. |
| F-1-4 | Fixed. All five checked routes have the same header and footer link sets. |
| F-1-5 | Fixed. Current headings and controls are descriptive and result-naming. |
| F-1-6 | Fixed. `/does-not-exist` returns the designed HTTP 404; its h1 receives focus and product resources log no error. |
| F-1-7 | Fixed. The current README inventory contains the requested short, plain rewrites. |
| F-2-1 | Fixed. Production Syncthing reading, details, and GET-only/file-preservation checks are registered and pass. |
| F-2-2 | Fixed. Public installer wording is narrowed to the tested macOS/Linux shell installer. |
| F-2-3 | Fixed. The app sends only overall status and attention count to its tray command; the tagged fixture test passes. |
| F-2-4 / F-3-1 | Fixed. Current desktop strings use `SYNC STATUS`, `NO SOURCES ADDED`, local-source language, and **Open sync tool**. The three current v0.1.6 walkthrough captures show those controls and the Nextcloud option. |
| F-2-5 | Fixed. The action outcome and offline, account/telemetry, and license facts are above the fold at 390 px and desktop. |
| F-2-6 | Fixed. GitHub destinations are named and retain an accessible external-site suffix. |
| F-2-7 / F-3-2 | Fixed. The generated audit now counts the h1, annotation, rendered fragments, and exact README URL. Regression tests and `npm run audit:copy:check` pass. |
| F-3-3 | Fixed. `release-cache-retention` is registered, passes, and source removes an expired release cache before fallback. |
| F-3-4 | Fixed. The current product includes a read-only Nextcloud desktop-log adapter, a mixed-provider demo, and the passing `nextcloud-desktop-log` claim. |

## Structure, routing, links, accessibility, and identity

- Cold live checks found one `h1`, one `main`, `lang="en"`, title, description, canonical, OG, Twitter card, and h1 focus on `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/does-not-exist`.
- The titles follow the required pattern: `Local Sync Observer — check local sync status`, `Demo — Local Sync Observer`, `Privacy — Local Sync Observer`, `Terms — Local Sync Observer`, and `Page not found — Local Sync Observer`.
- The live 404 returned 404, had a clear recovery action, and no product console errors. Route focus and Back/Forward behavior also pass the Playwright route test.
- All discovered non-fragment links returned 200: internal public pages, all current macOS/Windows/Linux GitHub release assets, source, and issue tracker.
- The full local Playwright suite passed 48/48 tests across desktop and 390 px, including Axe serious/critical checks, keyboard dialog use, 200% reflow, route metadata/focus, offline demo, and privacy request checks.
- The warm-paper, hard-rule, signal-yellow inspection-board system is visibly product-specific. The original cut-paper convergence asset and current desktop captures match the documented design thesis; it is not a generic SaaS card layout.

## Local verification

All checks passed:

```sh
npm run audit:copy:check
npm run check
npm run test:e2e
cargo test --manifest-path crates/observer-core/Cargo.toml
```

`npm run check` completed TypeScript, 14 Vitest tests, and both production builds. `npm run test:e2e` completed 48/48 tests. Core Rust completed 9/9 tests.

## What would make this perfect

Register and test the remaining mixed-provider-demo and no-probe-before-source statements in F-4-1, or remove the sentences. With that claims proof added, the live first-read flow, isolated demo, copy, routing, accessibility, history closures, and distinct visual system have no remaining observed gap.
