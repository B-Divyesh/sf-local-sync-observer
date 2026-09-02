# Adversarial first-read review 3 — Local Sync Observer

- Date: 2026-09-02 UTC
- Reviewed commit: `8932101d7daba7c20ca29409e18a745579766e1d`
- Live URL: <https://local-sync-observer.sociobot.in/>
- Fresh contexts: Chromium at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

`PASS` requires zero findings and no untested claim. This review records four
findings. Three are blocking, including two required history reopenings.

## Findings

### F-3-1 / F-2-4 (reopened) — BLOCKING — plain-language cleanup is incomplete and the walkthrough shows obsolete controls

**Locations and exact copy:**

- Current desktop app, `src/main.ts`: **“READ-ONLY CONVERGENCE BOARD”**,
  **“What has actually converged?”**, **“NO SOURCES / NO CLAIM”**,
  **“Connect evidence, not your files.”**, and **“Add Syncthing’s read-only
  REST status…”**.
- README: **“The demo uses a separate browser key.”**
- Live landing walkthrough images: `walkthrough-setup.webp` still shows
  **“Local API endpoint”** and **“Use a loopback/local endpoint.”**;
  `walkthrough-conflict.webp` still shows **“Start for real”** and
  **“Open owning tool”**.
- Current v0.1.5 app controls instead say **“Local Syncthing address”**,
  **“Add your sources”**, and **“Open sync tool”**.

**Why this fails:** `claim`, `convergence`, `evidence`, and `REST` require the
same technical interpretation that F-2-4 required the product to remove.
“Connect evidence, not your files” is contrast copy rather than an empty-state
instruction. The live walkthrough then teaches labels that no longer exist in
the app. The assets were last changed at commit `39df651` on 2026-08-30; the UI
copy changed at `6b28de2` on 2026-09-01. This is a half-fix of F-2-4 and is
therefore blocking under the review order.

**Concrete fix:** use direct first-run copy, for example:

- `SYNC STATUS` instead of `READ-ONLY CONVERGENCE BOARD`.
- `Check whether your folders finished syncing.` instead of `What has
  actually converged?`.
- `NO SOURCES ADDED` instead of `NO SOURCES / NO CLAIM`.
- `Add Syncthing or choose a folder` instead of `Connect evidence, not your
  files.`.
- `Connect Syncthing on this computer, or choose a folder to check names and
  timestamps. Nothing is changed.` instead of the REST/evidence sentence.
- `The demo keeps sample data separate from your saved settings.` instead of
  the README's “browser key” sentence.

Then recapture all three walkthrough frames from that same production build.
Add a check that the documented walkthrough version matches the app version.

### F-3-2 / F-2-7 (reopened) — BLOCKING — the generated copy audit still does not list every sentence with its real count

**Location:** `.factory/copy-audit.md` and `scripts/copy-audit.mjs`.

**Missing landing sentences:**

- **“Check what synced after offline work.”** — 6 words. It appears only in
  the uncounted heading list.
- **“A folder check can find common conflict copies.”** — 8 words. It is
  absent entirely.
- **“Only Syncthing’s pending count can establish ‘Converged.’”** — 7 words.
  It is absent entirely.

The script scans only `<p>` elements and one narrow `<figcaption>` shape. It
does not scan the sentence-bearing `.annotation` element. It also replaces the
README demo URL with **“the linked product page”**, so the committed audit is
not the exact sentence and reports 10 words instead of the visible sentence's
7 words.

**Why this fails:** F-2-7 required a generator covering complete rendered text.
`npm run audit:copy:check` passes only because it compares the incomplete
output with itself. The proof of simplicity can silently miss future long,
jargon-heavy, or banned copy.

**Concrete fix:** extract text from the rendered landing DOM, including
headings and non-`p` annotations, while excluding only controls and intentional
fragments. Preserve URLs as single tokens instead of replacing their visible
text. Add regression assertions for the three quoted landing sentences and
the exact `?demo=1` README sentence, then regenerate `.factory/copy-audit.md`.

### F-3-3 — BLOCKING — a quantitative privacy claim is unlisted and false in its stated form

**Location:** live `/privacy/`: **“It stores a cached GitHub release response
for up to one hour.”**

**Check:** no `.factory/claims.json` entry tests this retention limit. The
existing `site-private` claim checks request origins and cookies, not cache
age or deletion. In a fresh live context, I seeded
`local-sync-observer.release.v1` with a two-hour-old response and made the
GitHub request fail. The download fallback appeared, but the expired value
remained in local storage. `readCachedRelease()` declines to use an expired
value but never removes it.

**Why this fails:** “stores … for up to one hour” is a privacy promise about
retention. The implementation can store the response indefinitely after the
last successful fetch, and the promise is absent from the claims registry.

**Concrete fix:** delete an expired cache entry before returning `null`, add a
`release-cache-retention` claim, and test with a fake clock that an entry older
than one hour is removed even when GitHub is unavailable. Alternatively,
rewrite the page to state the actual retention behavior and register that
claim.

### F-3-4 — MEDIUM — the cross-tool observer has only one provider-specific integration

**Location:** brief **“shows pending/conflict/last-good state”** across sync
tools; live coverage card **“Other sync tools … It cannot report files waiting
in the sync tool.”**

**Why this matters:** the differentiating job is a neutral view across tools.
The current product supplies full pending/device status only for Syncthing;
every other tool is reduced to filename-pattern hints and an unknown result.
A person with the multi-tool stack named in the brief still has to open the
other tools to learn whether work is pending.

**Concrete feature:** add one read-only, provider-specific adapter for a
second common desktop sync tool, such as Nextcloud. Read only its documented
local status/log interface, report pending, conflict, offline, last-good, and
missing fields, and open that client for fixes. Add a realistic mixed-provider
demo and a fixture-backed claim test. AI is not useful for this deterministic
local status job; import/export would not close the stated cross-tool gap.

## First screen, before scrolling

The first-screen check passes at both viewport sizes.

| Question | Cold-visit answer |
| --- | --- |
| What does it do? | It checks whether Syncthing finished after offline work and shows pending files, conflicts, and device status. |
| For whom? | People who use Syncthing and need one place to check after offline work. |
| What should I click first? | **Try it with sample data**. |

At 390 × 844 and 1440 × 900, the headline, audience sentence, sample action,
result note, download actions, release identity, and all three short facts are
visible without scrolling. The page has no horizontal overflow. Evidence:
`review-3-evidence/mobile-cold.png`, `desktop-cold.png`, and
`cold-first-screen.json`.

## Copy audit

Counts use visible whitespace-separated words. Hyphenated compounds and URLs
count as one word. Conditional download fallback sentences are included.
Controls, headings without sentence punctuation, and fragments are checked
after the sentence tables.

### Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | Check what synced after offline work. | — |
| 2 | 18 | For people using Syncthing who need to see pending files, conflicts, and local device status in one place. | — |
| 3 | 8 | Opens a sample conflict board; nothing is saved. | — |
| 4 | 9 | The observer checks sync status without handling your files. | — |
| 5 | 9 | After reconnecting, “idle” may not mean every device agrees. | — |
| 6 | 12 | The observer combines Syncthing status with conflict-copy names and explains missing checks. | — |
| 7 | 9 | Add Syncthing on this computer or choose a folder. | — |
| 8 | 9 | Credentials and paths stay in the app’s local storage. | — |
| 9 | 16 | See pending counts, conflict-copy names, the last good check, and any details Syncthing did not report. | — |
| 10 | 6 | Open Syncthing from the affected row. | — |
| 11 | 11 | The observer uses read-only checks and does not change your files. | — |
| 12 | 13 | The empty board waits for a local source before it reports a status. | — |
| 13 | 9 | Add Syncthing on this computer or choose a folder. | — |
| 14 | 11 | The board shows the conflict and lists the checks it used. | — |
| 15 | 12 | If a check cannot show that syncing finished, the board says so. | — |
| 16 | 10 | Every status lists its checks and any missing Syncthing details. | — |
| 17 | 8 | A folder check can find common conflict copies. | — |
| 18 | 7 | Only Syncthing’s pending count can establish “Converged.” | — |
| 19 | 8 | Reads Syncthing’s local folder list and pending-file count. | — |
| 20 | 8 | It also checks folder names for conflict copies. | — |
| 21 | 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. | — |
| 22 | 4 | Never opens file content. | — |
| 23 | 9 | Use a folder check to find common conflict-copy names. | — |
| 24 | 9 | It cannot report files waiting in the sync tool. | — |
| 25 | 7 | Choose a build for your operating system. | — |
| 26 | 6 | Apple silicon and Intel disk images. | — |
| 27 | 3 | 64-bit Windows installer. | — |
| 28 | 4 | AppImage and Debian package. | — |
| 29 | 13 | The macOS and Linux shell installer checks the downloaded file before opening it. | — |
| 30 | 6 | Choose a build for your computer. | Conditional initial copy; clear. |
| 31 | 4 | Downloads are being published. | Conditional fallback; clear. |
| 32 | 4 | Open releases on GitHub. | Conditional fallback; clear. |

No landing sentence exceeds 22 words or uses a banned marketing adjective.
The average is 8.8 words. The complete inventory exposes the omissions in
F-3-2.

### README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 8 | Local Sync Observer checks Syncthing after offline work. | — |
| 2 | 9 | It shows whether your folders and devices finished syncing. | — |
| 3 | 9 | It observes sync evidence and does not sync files. | — |
| 4 | 8 | It reads Syncthing status and selected folder metadata. | — |
| 5 | 9 | It never opens file contents or changes a file. | — |
| 6 | 12 | When something needs attention, it opens the sync tool for the fix. | — |
| 7 | 7 | Try the isolated demo before installing: `https://local-sync-observer.sociobot.in/?demo=1`. | — |
| 8 | 7 | The demo uses a separate browser key. | Jargon; F-3-1. |
| 9 | 8 | It never reads or changes real observer data. | — |
| 10 | 10 | Download the build for your operating system from the website. | — |
| 11 | 8 | The shell installer fetches the release file list. | — |
| 12 | 7 | It checks the download before opening it. | — |
| 13 | 7 | See releases on GitHub for install details. | — |
| 14 | 3 | Open **Configure sources**. | — |
| 15 | 10 | Choose Syncthing and enter its local address and API key. | — |
| 16 | 10 | You can also choose a folder for a names-and-timestamps check. | — |
| 17 | 4 | Select **Save and inspect**. | — |
| 18 | 9 | The board checks again every 30 seconds while running. | — |
| 19 | 4 | Review the listed checks. | — |
| 20 | 9 | Use **Open sync tool** to resolve a finding there. | — |
| 21 | 8 | The tray tooltip shows the current overall reading. | — |
| 22 | 6 | It never includes filenames or paths. | — |
| 23 | 12 | Use Syncthing on this computer, such as `http://127.0.0.1:8384`, or a `.local` address. | — |
| 24 | 14 | Folder checks inspect names and metadata for at most 50,000 entries and 16 levels. | — |
| 25 | 6 | They can flag common conflict copies. | — |
| 26 | 13 | They do not show that syncing finished unless Syncthing reports no files waiting. | — |
| 27 | 8 | Prerequisites: Node.js 22, npm, and current stable Rust. | Developer context. |
| 28 | 12 | Tauri development also needs the Tauri 2 system dependencies on its website. | Developer context. |
| 29 | 8 | `npm run build` builds both `dist/app` and `dist/site`. | Developer context. |
| 30 | 10 | The release workflow runs on `v*` tags and manual dispatch. | Developer context. |
| 31 | 7 | It builds macOS, Windows, and Linux packages. | Covered by `release-matrix`. |
| 32 | 10 | It publishes `SHA256SUMS` and `latest.json` with the tagged source commit. | Covered by `release-matrix`. |
| 33 | 7 | The one-click demo is documented in `.factory/demo.md`. | — |
| 34 | 11 | Its observable product promises and exact test commands are in `.factory/claims.json`. | — |
| 35 | 9 | The landing page asks GitHub which release is current. | Covered by `release-downloads`. |
| 36 | 10 | If GitHub is unavailable, it links to the release page. | Covered by `release-fallback`. |
| 37 | 15 | Source labels, paths, local addresses, API keys, and readings stay in the app’s local storage. | Covered by `local-app-storage`. |
| 38 | 6 | API keys stay on this device. | Covered by `local-app-storage`. |
| 39 | 6 | Version 0.1 does not encrypt them. | Covered by `local-app-storage`. |
| 40 | 5 | Use a separate Syncthing key. | Instruction. |
| 41 | 9 | Remove the source when you no longer need it. | Instruction; removal is covered by `local-app-storage`. |
| 42 | 7 | The website has no analytics or cookies. | Covered by `site-private`. |
| 43 | 4 | See Privacy and Terms. | — |
| 44 | 5 | Licensed under the MIT License. | Covered by `mit-license`. |

No README sentence exceeds 22 words or uses a banned marketing adjective. The
average is 8.3 words. The jargon flag and rewrite are in F-3-1.

### Headings, controls, and terminology

- Landing headings are specific out of context: **Why one sync reading helps**,
  **How the observer checks a source**, **Sample conflict walkthrough**,
  **When the reading is unknown**, **Provider coverage and limits**, and
  **Install Local Sync Observer**.
- Landing and live-demo actions name their result: **Try it with sample data**,
  **Download for Linux from GitHub**, **View install options**, the three
  platform download actions, **Reset demo**, and **Choose a download**.
- README headings name their subject. Visitor-facing terminology is consistent:
  `reading`, `source`, `sync tool`, `demo`, `sample data`, `unknown`, and
  `converged`.
- The desktop-app and screenshot exceptions are the F-3-1 finding.

## Demo and sandbox behavior

The demo checks pass.

- **Try it with sample data** opens `/demo/?demo=1` in one click.
- The first 390 px screen already shows the banner and the start of a realistic
  `Field notes` conflict board.
- The persistent banner says **“Demo — sample data, nothing is saved to your
  real observer.”** and provides **Reset demo** and **Choose a download**.
- A tampered `demo:local-sync-observer.site.v1` value was replaced by Reset.
- A sentinel `local-sync-observer.v1` value remained byte-for-byte unchanged
  through entry, reset, and exit. Exit removed the demo key.
- The direct demo request log contained only
  `https://local-sync-observer.sociobot.in`.
- In its own browser context, the live demo retained the sample conflict after
  `context.setOffline(true)` and reload.

Evidence: `review-3-evidence/demo-mobile.png`, `demo-manual.json`, and
`live-offline-demo.json`.

## Registered claims

Each exact command in `.factory/claims.json` ran independently from the clean
clone `/tmp/local-sync-observer-review-3.wpDNSO/repo`.

| Claim | Exact command | Result |
| --- | --- | --- |
| `release-downloads` | `npm run test:e2e -- --grep @claim:release-downloads` | PASS, desktop and mobile |
| `release-matrix` | `npm test -- --testNamePattern @claim:release-matrix` | PASS |
| `checksum-install` | `npm test -- --testNamePattern @claim:checksum-install` | PASS |
| `evidence-boundary` | `npm test -- --testNamePattern @claim:evidence-boundary` | PASS |
| `metadata-only-scan` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_metadata_only_scan_preserves_contents_and_stays_unknown` | PASS |
| `scan-bounds` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_scan_bounds_are_fifty_thousand_entries_and_depth_sixteen` | PASS |
| `local-endpoint-only` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_local_endpoint_only_rejects_remote_endpoints` | PASS |
| `local-app-storage` | `npm run test:e2e -- --grep @claim:local-app-storage` | PASS, desktop and mobile |
| `open-owner` | `npm run test:e2e -- --grep @claim:open-owner` | PASS, desktop and mobile |
| `thirty-second-refresh` | `npm run test:e2e -- --grep @claim:thirty-second-refresh` | PASS, desktop and mobile |
| `site-private` | `npm run test:e2e -- --grep @claim:site-private` | PASS, desktop and mobile |
| `mit-license` | `npm test -- --testNamePattern @claim:mit-license` | PASS |
| `isolated-demo` | `npm run test:e2e -- --grep @claim:isolated-demo` | PASS, desktop and mobile |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | PASS, desktop and mobile |
| `offline-demo-reload` | `npm run test:e2e -- --grep @claim:offline-demo-reload` | PASS, desktop and mobile |
| `release-fallback` | `npm run test:e2e -- --grep @claim:release-fallback` | PASS, desktop and mobile |
| `syncthing-reading` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_syncthing_reading_reports_configured_folder_and_device_state` | PASS |
| `reading-details` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_reading_details_show_last_good_missing_fields_and_coverage` | PASS |
| `read-only-probe` | `cargo test --manifest-path crates/observer-core/Cargo.toml claim_observer_probe_is_get_only_and_does_not_change_files` | PASS |
| `tray-status` | `npm run test:e2e -- --grep @claim:tray-status` | PASS, desktop and mobile |
| `no-product-account` | `npm run test:e2e -- --grep @claim:no-product-account` | PASS, desktop and mobile |

All registered tests pass. F-3-3 is an unlisted live claim, so the claims gate
still fails overall.

## Earlier finding verification

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 | Fixed. All three dependency-free core commands pass in the clean clone, and Tauri imports `observer-core`. |
| F-1-2 | Fixed for its exact claims. Removed statements remain absent; the replacement claim entries pass. F-3-3 is a separate new privacy claim. |
| F-1-3 | Fixed. Demo, Privacy, Terms, and the designed 404 have route-specific descriptions, canonicals, OG/Twitter data, SVG favicons, and Apple touch icons. |
| F-1-4 | Fixed. All five checked routes use the same four header links and three footer links, one-liner, factory credit, and v0.1.5 identifier. |
| F-1-5 | Fixed for every named landing heading and **View install options**. |
| F-1-6 | Fixed for product behavior. Unknown URLs return the designed HTTP 404; all assets load; the h1 receives focus. Chromium logs only the expected main-document 404 status, not a broken product resource. |
| F-1-7 | Fixed. The three exact README sentences are short and use the prescribed wording. |
| F-2-1 | Fixed. The production Syncthing probe, reading details, GET-only behavior, tray status, and no-account behavior now have registered passing tests. |
| F-2-2 | Fixed. Public copy now narrows the promise to the tested macOS/Linux shell installer. |
| F-2-3 | Fixed. The current app sends overall state and attention count to the persistent tray; browser-bridge and Rust tooltip checks pass. |
| F-2-4 | **Not fixed; reopened by F-3-1.** Current first-run copy and the published walkthrough still contain the rejected language or obsolete labels. |
| F-2-5 | Fixed. The action result and offline, account/telemetry, and price/license facts remain above the fold at both widths. |
| F-2-6 | Fixed. Download, source, issue, and release links name GitHub and expose an external-site suffix where needed. |
| F-2-7 | **Not fixed; reopened by F-3-2.** The deterministic audit passes but still omits and rewrites sentences. |

## Structure, links, accessibility, and visual identity

- Titles pass: `Local Sync Observer — check local sync status`, `Demo — Local
  Sync Observer`, `Privacy — Local Sync Observer`, `Terms — Local Sync
  Observer`, and `Page not found — Local Sync Observer`.
- Every checked route has `lang="en"`, one `h1`, one `main`, a description,
  canonical, Open Graph and Twitter metadata, SVG/favicon assets, and heading
  focus after load.
- The unknown route returns HTTP 404 with a designed recovery page. Deep links,
  Back, and Forward restore the URL, h1 focus, and landing scroll position.
- Every internal, source, issue, and current release link returned 200. The only
  404 was the deliberate unknown-route probe.
- At 390 px, all routes fit the viewport and all visible controls are at least
  44 px. Axe found zero violations on all five routes. Reduced motion is
  explicitly handled in both site and app CSS.
- `/opt/fleet/lib/verify-url.sh` passed with no home-page console errors,
  missing alt text, or unlabeled buttons.
- The live first-load JavaScript is about 5.3 KB uncompressed, below the 150 KB
  static-site limit.
- The warm paper, hard rules, yellow inspection field, offset shadows, and
  original convergence-board artwork are distinct from a generic SaaS
  template. F-3-1 concerns stale UI content in the walkthrough, not the visual
  direction itself.

Evidence: `review-3-evidence/live-structure.json` and
`review-3-evidence/verify-url/verify.json`.

## Local quality gates

- `npm run audit:copy:check`: PASS, but it cannot detect F-3-2 because the
  generator omits the same content as the committed result.
- `npm run check`: PASS — TypeScript, 11 Vitest checks, and both production
  builds.
- `cargo test --manifest-path crates/observer-core/Cargo.toml`: PASS, 8/8.
- `npm run test:e2e`: PASS, 44/44 across desktop and 390 px mobile projects.

## What would make this perfect

Replace the remaining first-run jargon, recapture walkthroughs from the final
app, make the copy generator cover exact rendered sentences, and make the
one-hour release-cache statement true and claim-tested. Then add one
provider-specific integration beyond Syncthing so the product can deliver the
cross-tool view in its brief. A repeat review can return `PASS` only after all
four findings are gone and no new claim remains untested.
