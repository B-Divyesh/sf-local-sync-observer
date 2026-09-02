# Adversarial first-read review 5 — Local Sync Observer

- Date: 2026-09-02 UTC
- Reviewed commit: `ad3ae8eb3de82ba6d282373b7deffbecf34e16dc`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Fresh contexts: Chromium desktop at 1440 × 900 and Android/iPhone at 390 × 844
- Verdict: **FAIL**

`PASS` requires zero findings. This review has three blocking findings. Two are
regressions of earlier findings.

## First screen, before scrolling

The three cold-visit questions can be answered from the first screen:

| Question | First-read answer |
| --- | --- |
| What does it do? | It checks what finished syncing after offline work and shows pending work, conflicts, and connection status. |
| For whom? | People using Syncthing or Nextcloud who want those statuses in one place. |
| What should I click first? | **Try it with sample data**. The adjacent sentence says it opens a sample conflict board and saves nothing. |

The headline, audience sentence, and primary action are visible at both sizes.
The desktop first screen also shows all three facts. The real Android and
iPhone first screens do not: the third fact ends at CSS pixel 849 in an
844-pixel viewport. This reopens F-2-5 below. Evidence:
`review-5-evidence/desktop-cold.png`, `android-cold.png`, `iphone-cold.png`,
and `mobile-first-screen.json`.

## Findings

### F-5-1 / F-2-5 (reopened) — BLOCKING — the real phone first screen clips a required fact

**Location:** live `/` at 390 × 844 with Android and iPhone user agents.

**Exact copy:**

- “Desktop downloads are available for macOS, Windows, and Linux.”
- “This desktop app runs on macOS, Windows, and Linux. Open this site on a computer to download it.”
- “Free under the MIT License”

**Check:** both mobile user agents hide the unusable download correctly, but
they render two consecutive platform messages. That pushes the final required
fact below the fold. Its measured box is `top: 829`, `bottom: 849`; the viewport
ends at 844. The Android and iPhone results are identical. The existing
`@claim:mobile-desktop-handoff` test checks that the handoff is visible, but it
does not check the complete first-screen layout with a real mobile user agent.

**Why this fails:** F-2-5 required the action result and all three offline,
privacy, and price facts above the fold. The duplicated platform message
regresses that fixed layout and makes the phone first screen less concise.

**Concrete fix:** show one mobile handoff sentence, for example: **“This app
runs on macOS, Windows, and Linux. Open this site on a computer to download
it.”** Remove the separate “Desktop downloads are available…” line. Extend the
mobile-handoff claim test to assert that the bottom of every `.trust-list li`
is at or above `window.innerHeight` for both Android and iPhone contexts.

### F-5-2 / F-2-7 / F-3-2 (reopened) — BLOCKING — the generated copy audit duplicates and merges phone copy

**Location:** `.factory/copy-audit.md`, landing rows 5, 6, and 35;
`scripts/copy-audit.mjs`, runtime strings appended by `ordered.push(...)`.

**Exact audit rows:**

- Row 5: “This desktop app runs on macOS, Windows, and Linux.” — 9 words.
- Row 6: “Open this site on a computer to download it.” — 9 words.
- Row 35: “This desktop app runs on macOS, Windows, and Linux. Open this site on a computer to download it.” — incorrectly treated as one 18-word sentence.

**Check:** the generator correctly segments the HTML paragraph into two
sentences, then appends the same runtime text as one unsplit string after
deduplication. `npm run audit:copy:check` passes because it reproduces the same
incorrect artifact.

**Why this fails:** the required audit must list each sentence once with its
own count. F-2-7 and F-3-2 previously required complete, accurate generated
coverage. This is a regression of that proof, so it is blocking under the
history rule.

**Concrete fix:** pass every runtime string through the existing `sentences()`
function before combining it with markup text, then deduplicate after the
runtime variants are included. Add a regression test that the two mobile
sentences each appear once and that no audit row contains both.

### F-5-3 — BLOCKING — Back navigation loses the landing scroll position

**Location:** live navigation from `/` to `/privacy/`; route behavior in
`site/route-focus.ts`.

**Check:** in a fresh 1440 × 900 context, the landing page was set to
`scrollY = 1000`, then the visible Privacy header link was selected. The
Privacy page loaded at the top with its h1 focused. Browser Back returned to
the correct `/` URL and focused its h1, but `scrollY` was `0`, not `1000`.
Forward again loaded Privacy at `0`. Evidence is
`review-5-evidence/live-history.json`.

**Why this fails:** the site-structure contract requires Back and Forward to
restore scroll and focus. The URL and focus work, but the user loses their
place on a long landing page. This is broken routing behavior and therefore
blocking. The current route test checks metadata and h1 focus only; it has no
history or scroll assertion.

**Concrete fix:** preserve scroll per history entry while retaining route h1
focus on new navigation. A small History API router or an explicit
`sessionStorage`/`history.state` restoration can do this. Add a browser test
that scrolls to 1000, follows Privacy, uses Back and Forward, and asserts the
URL, restored scroll position, and focused route h1 at each step.

## Copy audit

Counts use whitespace-separated words. Hyphenated terms and URLs count once.
Conditional runtime text is included. No current sentence exceeds 22 words,
uses a banned marketing adjective, or introduces unexplained visitor-facing
jargon. F-5-1 flags the redundant phone handoff. F-5-2 flags the committed
generator, not an additional sentence below.

### Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | Check what synced after offline work. | — |
| 2 | 17 | For people using Syncthing or Nextcloud who need pending work, conflicts, and connection status in one place. | — |
| 3 | 8 | Opens a sample conflict board; nothing is saved. | — |
| 4 | 6 | Choose a build for your computer. | Initial runtime copy. |
| 5 | 9 | This desktop app runs on macOS, Windows, and Linux. | F-5-1: redundant beside row 34. |
| 6 | 9 | Open this site on a computer to download it. | — |
| 7 | 9 | The observer checks sync status without handling your files. | — |
| 8 | 9 | After reconnecting, “idle” may not mean every device agrees. | — |
| 9 | 11 | The observer combines Syncthing status, Nextcloud desktop logs, and conflict-copy names. | — |
| 10 | 9 | Add Syncthing, a Nextcloud desktop log, or a folder. | — |
| 11 | 9 | Credentials and paths stay in the app’s local storage. | — |
| 12 | 17 | See pending activity, conflicts, the last completed sync, and any details your sync tool did not report. | — |
| 13 | 8 | Open the affected sync tool from its row. | — |
| 14 | 11 | The observer uses read-only checks and does not change your files. | — |
| 15 | 12 | If a check cannot show that syncing finished, the board says so. | — |
| 16 | 10 | Every status lists its checks and any missing Syncthing details. | — |
| 17 | 8 | Reads Syncthing’s local folder list and pending-file count. | — |
| 18 | 8 | It also checks folder names for conflict copies. | — |
| 19 | 13 | Reads its local log for conflicts, connection problems, pending activity, and completed syncs. | — |
| 20 | 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. | — |
| 21 | 4 | Never opens file content. | — |
| 22 | 7 | Choose a build for your operating system. | — |
| 23 | 6 | Apple silicon and Intel disk images. | — |
| 24 | 3 | 64-bit Windows installer. | — |
| 25 | 4 | AppImage and Debian package. | — |
| 26 | 13 | The macOS and Linux shell installer checks the downloaded file before opening it. | — |
| 27 | 13 | The empty board waits for a local source before it reports a status. | — |
| 28 | 11 | Add Syncthing, choose a Nextcloud desktop log, or choose a folder. | — |
| 29 | 11 | The board shows the conflict and lists the checks it used. | — |
| 30 | 8 | A folder check can find common conflict copies. | — |
| 31 | 7 | Only Syncthing’s pending count can establish “Converged.” | — |
| 32 | 4 | Downloads are being published. | Conditional fallback. |
| 33 | 4 | Open releases on GitHub. | Conditional fallback. |
| 34 | 9 | Desktop downloads are available for macOS, Windows, and Linux. | F-5-1: redundant beside row 5. |

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
| 11 | 13 | Local Sync Observer runs on macOS, Windows, and Linux, not Android or iPhone. | — |
| 12 | 8 | The shell installer fetches the release file list. | — |
| 13 | 7 | It checks the download before opening it. | — |
| 14 | 7 | See releases on GitHub for install details. | — |
| 15 | 3 | Open **Configure sources**. | — |
| 16 | 10 | Choose Syncthing and enter its local address and API key. | — |
| 17 | 11 | You can also choose a Nextcloud desktop log or folder check. | — |
| 18 | 4 | Select **Save and inspect**. | — |
| 19 | 9 | The board checks again every 30 seconds while running. | — |
| 20 | 4 | Review the listed checks. | — |
| 21 | 9 | Use **Open sync tool** to resolve a finding there. | — |
| 22 | 8 | The tray tooltip shows the current overall reading. | — |
| 23 | 6 | It never includes filenames or paths. | — |
| 24 | 12 | Use Syncthing on this computer, such as http://127.0.0.1:8384, or a .local address. | — |
| 25 | 7 | Nextcloud checks read its local desktop log. | — |
| 26 | 10 | They show conflicts, connection problems, pending activity, and completed syncs. | — |
| 27 | 9 | The log does not provide a reliable pending-file count. | — |
| 28 | 14 | Folder checks inspect names and metadata for at most 50,000 entries and 16 levels. | — |
| 29 | 6 | They can flag common conflict copies. | — |
| 30 | 13 | They do not show that syncing finished unless Syncthing reports no files waiting. | — |
| 31 | 8 | Prerequisites: Node.js 22, npm, and current stable Rust. | Developer context. |
| 32 | 12 | Tauri development also needs the Tauri 2 system dependencies on its website. | Developer context. |
| 33 | 8 | npm run build builds both dist/app and dist/site. | Developer context. |
| 34 | 10 | The release workflow runs on v* tags and manual dispatch. | Developer context. |
| 35 | 7 | It builds macOS, Windows, and Linux packages. | — |
| 36 | 10 | It publishes SHA256SUMS and latest.json with the tagged source commit. | — |
| 37 | 7 | The one-click demo is documented in .factory/demo.md. | — |
| 38 | 11 | Its observable product promises and exact test commands are in .factory/claims.json. | — |
| 39 | 9 | The landing page asks GitHub which release is current. | — |
| 40 | 10 | If GitHub is unavailable, it links to the release page. | — |
| 41 | 15 | Source labels, paths, local addresses, API keys, and readings stay in the app’s local storage. | — |
| 42 | 6 | API keys stay on this device. | — |
| 43 | 6 | Version 0.1 does not encrypt them. | — |
| 44 | 5 | Use a separate Syncthing key. | — |
| 45 | 9 | Remove the source when you no longer need it. | — |
| 46 | 7 | The website has no analytics or cookies. | — |
| 47 | 9 | It removes cached GitHub release details after one hour. | — |
| 48 | 4 | See Privacy and Terms. | — |
| 49 | 5 | Licensed under the MIT License. | — |

### Headings, controls, and terms

Landing headings name their sections: **Why one sync reading helps**, **How
the observer checks a source**, **Sample conflict walkthrough**, **When the
reading is unknown**, **Provider coverage and limits**, and **Install Local
Sync Observer**. README headings name their subjects. Controls use
result-naming verbs, including **Try it with sample data**, **View install
options**, platform-specific download actions, **Reset demo**, and **Choose a
download**. The product consistently uses `reading`, `source`, `sync tool`,
`demo`, `sample data`, `unknown`, and `converged` for their defined concepts.

## Demo and sandbox behavior

- **Try it with sample data** opens `/demo/?demo=1` in one click.
- The first phone screen already shows the demo banner and a realistic board
  with `Syncthing: Field notes` in Conflict and `Nextcloud: Shared research`
  in Pending.
- The banner says **“Demo — sample data, nothing is saved to your real
  observer.”** and keeps **Reset demo** and **Choose a download** visible.
- Reset recreated only `demo:local-sync-observer.site.v1`. A seeded
  `local-sync-observer.v1 = real-sentinel` remained unchanged.
- Leaving the demo removed the demo key and retained the real-data sentinel.
- Direct demo requests were same-origin only. The landing page additionally
  contacted only the disclosed GitHub release API and set no cookies.
- A dedicated offline context reloaded the demo with the Syncthing conflict
  and Nextcloud pending state intact.

Evidence: `review-5-evidence/live-cold-demo.json` and `demo-mobile.png`.

## Claims

All 26 exact commands in `.factory/claims.json` ran independently from a
clean clone of the reviewed commit after `npm ci --include=dev`. Every command
passed. Full command output is in
`review-5-evidence/claims-summary.txt`.

| Claim ID | Result |
| --- | --- |
| `release-downloads` | PASS |
| `release-matrix` | PASS |
| `checksum-install` | PASS |
| `evidence-boundary` | PASS |
| `metadata-only-scan` | PASS |
| `scan-bounds` | PASS |
| `local-endpoint-only` | PASS |
| `mobile-desktop-handoff` | PASS, but its layout assertion is incomplete; see F-5-1. |
| `local-app-storage` | PASS |
| `open-owner` | PASS |
| `thirty-second-refresh` | PASS |
| `site-private` | PASS |
| `mit-license` | PASS |
| `isolated-demo` | PASS |
| `demo-private` | PASS |
| `offline-demo-reload` | PASS |
| `release-fallback` | PASS |
| `syncthing-reading` | PASS |
| `reading-details` | PASS |
| `read-only-probe` | PASS |
| `tray-status` | PASS |
| `no-product-account` | PASS |
| `release-cache-retention` | PASS |
| `nextcloud-desktop-log` | PASS |
| `mixed-provider-demo` | PASS |
| `checks-require-source` | PASS |

The current landing and README product claims map to these entries. No
additional unlisted material product claim was found.

## Earlier finding verification

Every earlier review, polish report, and the incoming handoff was read. Each
earlier finding was checked against the live site and current source.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | Fixed. Dependency-free core claim commands pass in the clean clone. |
| F-1-2 | Fixed. The removed assertions remain absent and replacement claims pass. |
| F-1-3 | Fixed. All five routes have route metadata, social cards, and icons. |
| F-1-4 | Fixed. Header and footer link sets match on all routes. |
| F-1-5 | Fixed. The named landing headings and install action remain descriptive. |
| F-1-6 | Fixed for its exact issue. The true 404 is designed, loads product resources, and focuses its h1. Chromium logs only the expected main-document 404 status. |
| F-1-7 | Fixed. The named README sentences remain short and plain. |
| F-2-1 | Fixed. Syncthing reading, detail, and non-changing behavior claims pass. |
| F-2-2 | Fixed. Public checksum wording remains limited to the tested shell installer. |
| F-2-3 | Fixed. The tray receives only overall status and attention count. |
| F-2-4 / F-3-1 | Fixed. Current app copy and v0.1.7 walkthroughs use the revised controls and include Nextcloud. |
| F-2-5 | **Regressed; reopened by F-5-1.** The third fact is clipped for actual phone user agents. |
| F-2-6 | Fixed. External destinations name GitHub and expose the external-site suffix. |
| F-2-7 / F-3-2 | **Regressed; reopened by F-5-2.** The generated audit duplicates and merges the mobile handoff sentences. |
| F-3-3 | Fixed. Expired release cache data is removed and its claim passes. |
| F-3-4 | Fixed. The Nextcloud log adapter, mixed demo, and production claim pass. |
| F-4-1 | Fixed. `mixed-provider-demo` and `checks-require-source` are registered and pass. |

## Structure, accessibility, links, and identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and the true 404 each have a
  route title, description, canonical, Open Graph/Twitter card, favicon,
  Apple-touch icon, `lang="en"`, one h1, and one main landmark.
- Titles follow the required pattern. Every route focuses its h1. F-5-3 is the
  remaining browser-history failure.
- The same header and footer links appear on every route. All normal internal,
  GitHub source/issue, and current release links return 200. The only 404 is
  the deliberate unknown-route check; its same-document skip link works.
- Live Axe reports zero violations on all five routes. There is no horizontal
  overflow, missing image alternative, unnamed button, product console error,
  or failed subresource. The true 404 produces only Chromium’s expected
  main-document status message.
- Security headers, `robots.txt`, `sitemap.xml`, service-worker demo cache,
  reduced-motion CSS, 44-pixel controls, and the sub-150 KB JavaScript budget
  are present. The live home JavaScript is about 1.8 KB gzip.
- The warm paper, hard black rules, signal yellow, offset shadows, original
  inspection-board art, and instrument-like layout match `.factory/design.md`
  and do not resemble a generic SaaS template.

Evidence: `review-5-evidence/live-structure.json` and
`review-5-evidence/verify-url/verify.json`.

## Local verification

- `npm run audit:copy:check`: PASS, but F-5-2 explains why its assertion is
  incomplete.
- `npm run check`: PASS; 14 Vitest tests and both production builds.
- `npm run test:e2e`: PASS; 53 passed and 3 expected mobile skips.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: PASS, 9/9.
- Live `verify-url.sh`: PASS with no home-page console error.

## Missed leverage

No missing AI feature, import/export, or sync action is indicated. This is a
deterministic, read-only observer; adding AI or making it a sync engine would
conflict with the brief. Syncthing status, Nextcloud log status, folder checks,
tray status, and opening the owning tool cover the obvious product-specific
expectations.

## What would make this perfect

Remove the duplicated phone handoff so all three facts fit in 390 × 844, repair
the copy-audit generator so each sentence appears once, and preserve landing
scroll position through Back/Forward navigation. Add the three regression
assertions described above. A repeat review can return `PASS` only when all
three findings are closed and no new finding appears.
