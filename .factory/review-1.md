# First-read review 1 — Local Sync Observer

- Date: 2026-09-01 UTC
- Reviewer context: fresh Chromium contexts at 390 × 844 and 1440 × 900; no existing browser storage
- Live URL: `https://local-sync-observer.sociobot.in/`
- Result: **FAIL**

`PASS` requires zero findings. This review records seven findings, including two blocking findings.

## First screen

Before scrolling, the reviewer could confirm the following at both sizes:

| Question | First-read answer |
| --- | --- |
| What does it do? | It checks whether Syncthing folders and devices agree after offline work, and shows pending files or conflicts. |
| For whom? | People who use Syncthing after working offline. |
| What should I click first? | **Try it with sample data**. |

The headline, audience sentence, primary action, and three short facts are visible in the phone first screen. This check passes.

## Findings

### F-1-1 — BLOCKING — three registered claim tests do not run from the clean clone

**Location:** `.factory/claims.json` entries `metadata-only-scan`, `scan-bounds`, and `local-endpoint-only`.

**Check:** A fresh clone completed `npm ci`. Each exact registered Cargo command then failed before its test ran:

```text
error: failed to run custom build command for `glib-sys v0.18.1`
Package 'glib-2.0', required by 'virtual:world', not found
```

The failed commands were:

```sh
cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only_scan_preserves_contents_and_stays_unknown
cargo test --manifest-path src-tauri/Cargo.toml claim_scan_bounds_are_fifty_thousand_entries_and_depth_sixteen
cargo test --manifest-path src-tauri/Cargo.toml claim_local_endpoint_only_rejects_remote_endpoints
```

The README names Tauri system dependencies as a prerequisite, but the stated claim commands are not runnable in this review sandbox from a clean clone. The claims gate therefore does not confirm three material promises.

**Required fix:** provide a reproducible, repository-documented bootstrap used before every claim command in the supported Linux verifier, or move the pure status/probe code and these claim tests into a dependency-free crate. Run each exact command in the clean sandbox and record the result.

### F-1-2 — BLOCKING — material live and README promises are not individually registered as claims

**Location and exact copy:**

- Landing, method label: **“The two-minute check”**.
- Landing, coverage: **“Nextcloud and Resilio adapters are not in v0.1.”**
- Landing, coverage: **“Their folders can be observed, but provider-specific pending state is not claimed.”**
- Landing, install: **“v0.1 packages are unsigned; your operating system may ask you to confirm the first launch.”**
- Landing, install: **“Every installer is published with SHA-256 checksums.”**
- README, Demo and claims: **“The landing page requests CORS-safe release metadata from `api.github.com`; if it is unavailable, it shows a release-page link without failing the page.”**
- README, Privacy and security: **“API keys are local but not encrypted by v0.1; use a dedicated/revocable Syncthing key and remove the source when it is no longer needed.”**

The current registry has related checks, but none lists these promises or proves their complete observable outcome. For example, `checksum-install` proves the shell installer’s good/bad hash behavior; it does not prove that every published installer has a checksum. `release-downloads` proves a detected Linux URL against an intercepted fixture; it does not prove the fallback wording/behavior. The two-minute statement is quantitative and has no measurement test.

These are claims a visitor could rely on. The claims contract requires an entry and an observable sandbox test for each, or removal of the promise.

**Required fix:** remove the unprovable two-minute and version/platform assertions, or add one claim entry and one clean-sandbox test per assertion. Add a release-fixture fallback test, a published-manifest checksum completeness test, an encryption/storage disclosure test that checks the app behavior, and a measured setup-flow test if the two-minute statement remains.

### F-1-3 — HIGH — public routes omit required social metadata

**Location:** live `/demo/`, `/privacy/`, `/terms/`, and the live unknown-route 404 page.

**Check:** `/demo/`, `/privacy/`, and `/terms/` have titles, descriptions, canonicals, favicons, and one `h1`, but all return `null` for `meta[property="og:title"]` and `meta[name="twitter:card"]`. The 404 additionally has no meta description, canonical, Apple touch icon, Open Graph, or Twitter metadata.

The site-structure contract requires canonical, Open Graph, Twitter, and favicon metadata per route. A shared link to the demo, legal page, or recovery page therefore has no product-specific preview.

**Required fix:** add route-specific Open Graph title/description/image and Twitter-card tags to every public route. Add a plain description, canonical, and Apple touch icon to the 404 route.

### F-1-4 — MEDIUM — header and footer navigation are not consistent across routes

**Location:** live `/`, `/demo/`, `/privacy/`, `/terms/`, and 404.

**Check:** the landing header contains `Demo`, `How it works`, `Coverage`, and `Download`, but no Privacy link. The demo header has `Home` and `Privacy`; privacy and terms have `Demo` and `Home`; the 404 has only the wordmark. Footer link sets also differ: the landing has Privacy, Terms, Source; the demo has Privacy and Terms; legal pages omit their own route and include Source; 404 has Privacy and Terms.

This does not meet the required consistent header/footer skeleton, and a visitor on the 404 cannot navigate directly to the demo.

**Required fix:** use one shared header and footer on all public routes. Keep the wordmark, Demo, a product section, and Privacy in the header; keep Privacy, Terms, source, product one-liner, and build identifier in every footer.

### F-1-5 — MEDIUM — several landing headings and a button do not state their section or result

**Location and exact copy:**

- `h2`: **“Four tabs. Three logs. Still no answer.”**
- `h2`: **“Observe. Explain. Hand off.”**
- eyebrow and `h2`: **“Designed for honesty”** / **““Unknown” is a feature.”**
- `h2`: **“Small surface. Explicit limits.”**
- `h2`: **“One local tool. No account.”**
- button-like link: **“All install options”**

These labels are mood, contrast, or slogan copy rather than section names. A heading-list user cannot determine what each section contains. `All install options` names a destination but not an action.

**Required fix:** use `Why one sync reading helps`, `How the observer checks a source`, `When the reading is unknown`, `Provider coverage and limits`, `Install Local Sync Observer`, and `View install options`. Retain the useful explanatory paragraphs beneath them.

### F-1-6 — MEDIUM — exact 404 navigation produces a console error and does not give focus to the recovery heading

**Location:** `https://local-sync-observer.sociobot.in/does-not-exist`.

**Check:** the server correctly returns the styled 404 page and HTTP 404. Chromium also reports `Failed to load resource: the server responded with a status of 404 ()` for the document load. After navigation on every checked public route, `document.activeElement` is `BODY`, not the route `h1`.

The 404 design is present, but the stated no-console-error and route-change focus checks do not confirm. Screen-reader and keyboard users receive no focused route heading after navigation.

**Required fix:** check the deployed unknown-route response in the production browser test and eliminate any avoidable document/subresource console error while retaining a real 404. Add a small shared route-load script that focuses the `h1` (with `tabindex="-1"`) after a full-document navigation, and test deep links, Back, and focus restoration.

### F-1-7 — LOW — README copy exceeds the plain-words cap and uses undefined technical shorthand

**Location and exact copy:**

- README opening: **“Local Sync Observer is a free, local-only desktop utility for people who use Syncthing and need one clear answer after offline work: have the folders and devices actually converged?”** (29 words).
- README Demo and claims: **“The landing page requests CORS-safe release metadata from `api.github.com`; if it is unavailable, it shows a release-page link without failing the page.”** (24 words).
- README Privacy and security: **“API keys are local but not encrypted by v0.1; use a dedicated/revocable Syncthing key and remove the source when it is no longer needed.”** (26 words).

Terms including “converged”, “CORS-safe”, “release metadata”, and “dedicated/revocable” are not explained where a first-time reader encounters them.

**Required fix:** split the first sentence into: “Local Sync Observer checks Syncthing after offline work. It shows whether your folders and devices finished syncing.” Split the metadata sentence into: “The landing page asks GitHub which release is current. If GitHub is unavailable, it links to the release page.” Split the security sentence into: “API keys stay on this device. Version 0.1 does not encrypt them. Use a separate Syncthing key and remove the source when you no longer need it.”

## Demo and privacy check

This check passes. A fresh visit to `/demo/` immediately showed a Field notes conflict, the persistent **“Demo — sample data, nothing is saved to your real observer.”** banner, **Reset demo**, and **Start for real**. The only demo storage key was `demo:local-sync-observer.site.v1`. Reset recreated only that key. **Start for real** cleared it and preserved a sentinel `local-sync-observer.v1` real-data key. The request log for the demo contained only `https://local-sync-observer.sociobot.in`.

The cold landing requested only the product origin plus disclosed `https://api.github.com`; it created no cookies and emitted no console/page errors. The dedicated offline-demo registered claim test passed.

## Claims command results

| Claim IDs | Result from clean clone |
| --- | --- |
| `release-downloads`, `release-matrix`, `checksum-install`, `evidence-boundary` | PASS |
| `metadata-only-scan`, `scan-bounds`, `local-endpoint-only` | FAIL — `glib-2.0` development package unavailable before test startup (F-1-1) |
| `local-app-storage`, `open-owner`, `thirty-second-refresh`, `site-private` | PASS |
| `mit-license`, `isolated-demo`, `demo-private`, `offline-demo-reload` | PASS |

`npm run check` passed (TypeScript, 10 Vitest tests, app/site builds). `npm run test:e2e` passed 34/34. Live Axe at 390 px reported no serious or critical violations on `/`, `/demo/`, `/privacy/`, or `/terms/`. At an effective 195 CSS-pixel viewport, all five checked routes had no horizontal overflow and no visible control below 44 px. All crawled public, GitHub release, source, and issue links returned 200.

## Copy audit

The following inventories list every prose sentence on the landing page and README. Navigation labels, button labels, table data, file paths, commands, and image alternatives are not sentences; the section above separately checks headings and controls. Counts treat a hyphenated term and a version as one word.

### Landing page

| # | Words | Sentence |
| ---: | ---: | --- |
| 1 | 6 | Check what synced after offline work. |
| 2 | 18 | For people using Syncthing who need to see pending files, conflicts, and local device status in one place. |
| 3 | 11 | Try the sample first, or download a build for your computer. |
| 4 | 4 | Downloads are being published. |
| 5 | 4 | Open the release page. |
| 6 | 7 | The observer sits outside your data path. |
| 7 | 8 | It sees evidence; it never moves a file. |
| 8 | 2 | Four tabs. |
| 9 | 2 | Three logs. |
| 10 | 3 | Still no answer. |
| 11 | 10 | After reconnecting, “idle” does not always mean every device agrees. |
| 12 | 18 | Local Sync Observer turns each provider’s evidence into a careful reading—and refuses to call folder metadata alone “synced.” |
| 13 | 1 | Observe. |
| 14 | 1 | Explain. |
| 15 | 2 | Hand off. |
| 16 | 9 | Add a loopback Syncthing API or choose a folder. |
| 17 | 9 | Credentials and paths stay in the app’s local storage. |
| 18 | 16 | See pending counts, known conflict-copy names, last-good checks, and exactly what the provider did not report. |
| 19 | 8 | Open the owning tool from the affected row. |
| 20 | 8 | The observer never resolves, renames, or deletes anything. |
| 21 | 7 | See the reading before you connect anything. |
| 22 | 11 | The empty board asks for evidence before it reports a status. |
| 23 | 11 | Add a local Syncthing endpoint or choose folder metadata. |
| 24 | 11 | The board shows the conflict and explains what the evidence proves. |
| 25 | 4 | “Unknown” is a feature. |
| 26 | 10 | If an integration cannot prove convergence, the board says so. |
| 27 | 14 | Every status includes its evidence coverage, so a reassuring color never outruns the facts. |
| 28 | 7 | Folder observation can detect common conflict copies. |
| 29 | 7 | Only provider-reported pending counts can establish “Converged.” |
| 30 | 2 | Small surface. |
| 31 | 2 | Explicit limits. |
| 32 | 15 | Reads local REST folder configuration and `needFiles`; scans configured folder names for common conflict copies. |
| 33 | 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. |
| 34 | 4 | Never opens file content. |
| 35 | 8 | Nextcloud and Resilio adapters are not in v0.1. |
| 36 | 12 | Their folders can be observed, but provider-specific pending state is not claimed. |
| 37 | 3 | One local tool. |
| 38 | 2 | No account. |
| 39 | 7 | Choose the checksum-verified build for your platform. |
| 40 | 15 | v0.1 packages are unsigned; your operating system may ask you to confirm the first launch. |
| 41 | 6 | Apple silicon and Intel disk images. |
| 42 | 3 | 64-bit Windows installer. |
| 43 | 4 | AppImage and Debian package. |
| 44 | 7 | Every installer is published with SHA-256 checksums. |
| 45 | 9 | The one-line installers verify before opening or installing anything. |

No landing prose sentence exceeds 22 words. The heading/control findings are F-1-5; the unregistered landing claims are F-1-2.

### README

| # | Words | Sentence |
| ---: | ---: | --- |
| 1 | 29 | Local Sync Observer is a free, local-only desktop utility for people who use Syncthing and need one clear answer after offline work: have the folders and devices actually converged? |
| 2 | 9 | It is intentionally an observer, not a sync engine. |
| 3 | 14 | v0.1 reads Syncthing’s local REST status and scans selected folder metadata for common conflict-copy names. |
| 4 | 11 | It never opens file contents, sends telemetry, or changes a file. |
| 5 | 12 | When something needs attention, it opens the owning tool for the fix. |
| 6 | 6 | Live site: https://local-sync-observer.sociobot.in |
| 7 | 11 | Try the isolated sample before installing: https://local-sync-observer.sociobot.in/demo/. |
| 8 | 22 | It shows a realistic conflict reading and uses a separate demo storage key, so it never reads or changes real observer data. |
| 9 | 13 | Download the build detected for your operating system from the website, or use: |
| 10 | 3 | On Windows PowerShell: |
| 11 | 19 | The scripts fetch `latest.json`, download the matching GitHub Release asset, and verify its SHA-256 checksum before installing or opening it. |
| 12 | 5 | v0.1 packages are unsigned. |
| 13 | 17 | On macOS, control-click the app and choose **Open** the first time; Windows may show a SmartScreen prompt. |
| 14 | 3 | Open **Configure sources**. |
| 15 | 22 | Choose Syncthing and enter its local URL plus the API key from **Actions → Settings → General**, or choose a folder for metadata-only observation. |
| 16 | 4 | Select **Save and inspect**. |
| 17 | 9 | The board checks again every 30 seconds while running. |
| 18 | 22 | If the reading is pending, conflicted, unavailable, or unknown, inspect the coverage note and use **Open owning tool** to resolve it there. |
| 19 | 9 | Syncthing endpoints must be loopback addresses or `.local` hosts. |
| 20 | 15 | Folder scans inspect names and metadata for at most 50,000 entries and 16 levels. |
| 21 | 15 | Folder scans can flag common conflict copies but do not claim convergence without provider evidence. |
| 22 | 18 | Prerequisites: Node.js 22, npm, current stable Rust, and the Tauri 2 system dependencies for your operating system. |
| 23 | 7 | The static deployment build command is exactly: |
| 24 | 10 | `npm run build` builds both `dist/app` and `dist/site`. |
| 25 | 10 | The release workflow runs on `v*` tags and manual dispatch. |
| 26 | 15 | It builds macOS arm64/x64 DMGs, Windows MSI/NSIS packages, and Linux AppImage/DEB packages. |
| 27 | 12 | It then publishes `SHA256SUMS` and `latest.json` with the tagged source commit. |
| 28 | 18 | CI runs the web checks on Linux and Windows so test discovery cannot depend on shell glob expansion. |
| 29 | 9 | The one-click demo is documented in [`.factory/demo.md`](.factory/demo.md). |
| 30 | 17 | Its observable product promises and the exact command that checks each one are in [`.factory/claims.json`](.factory/claims.json). |
| 31 | 24 | The landing page requests CORS-safe release metadata from `api.github.com`; if it is unavailable, it shows a release-page link without failing the page. |
| 32 | 17 | Source labels, paths, endpoints, API keys, and cached readings are stored in the app WebView’s local storage. |
| 33 | 26 | API keys are local but not encrypted by v0.1; use a dedicated/revocable Syncthing key and remove the source when it is no longer needed. |
| 34 | 7 | The website has no analytics or cookies. |
| 35 | 4 | See [Privacy](https://local-sync-observer.sociobot.in/privacy/) and [Terms](https://local-sync-observer.sociobot.in/terms/). |
| 36 | 5 | Product scope: [`.factory/brief.json`](.factory/brief.json) |
| 37 | 9 | Visual system and original image provenance: [`.factory/design.md`](.factory/design.md) |
| 38 | 7 | Build and verification handoff: [`.factory/handoff.md`](.factory/handoff.md) |
| 39 | 5 | Licensed under the [MIT License](LICENSE). |

README rows 1, 31, and 33 are over 22 words; row 1 and rows 3, 15, 31, and 33 contain first-use technical shorthand. F-1-7 gives exact replacements.

## Earlier-review history check

No prior `.factory/review-*.md` or `.factory/polish-*.md` file exists. The earlier `.factory/verification-2.md` findings were rechecked against live and source:

| Earlier finding | Current confirmation |
| --- | --- |
| Candidate release absent / site linked to old binary | Fixed: the live detected Linux link is a v0.1.2 AppImage. Crawled macOS, Windows, and Linux release links returned 200. |
| Claims registry incomplete and release-download assertion weak | Registry coverage and the exact fixture assertion were expanded, but three registered Cargo claim commands now fail in the clean sandbox (F-1-1), and further live/README claims remain unlisted (F-1-2). |
| 404 unstyled with CSS/CSP errors | The 404 is styled and its stylesheet returns 200. The exact unknown route still generates a document 404 console error and has incomplete metadata/focus behavior (F-1-3, F-1-6). |
| 200% reflow failed | Fixed: at effective 195 CSS pixels, all checked routes have `scrollWidth === innerWidth` and no visible control below 44 px. |
| Walkthrough lacked real frames | Fixed: three captioned real UI frames are present. |
| Landing copy audit was partial | Fixed for the landing: `.factory/copy-audit.md` lists its landing prose. This review adds the required README audit. |

## Structure and scope checks

- The home title, description, canonical, Open Graph/Twitter card, favicon, one `h1`, main landmark, design-specific visual system, robots, sitemap, CSP, and static 404 presentation were confirmed.
- The demo is directly deep-linkable. Reset and leaving demo preserve real storage. The Back check restores the prior document in browser history; focus restoration is not confirmed (F-1-6).
- No dead links were found among landing, demo, privacy, terms, source, issues, or release downloads.
- The brief calls for a deterministic, read-only local observer. No AI runtime feature is required for that job, and none was found. The normal expectation to see a sample conflict is met.

## What would make this perfect

Make every registered claim runnable in the clean verifier, register or remove every material promise, complete route metadata and shared navigation, restore focus on route loads, remove the 404 console error, and replace slogan headings and overlong README sentences with the proposed plain copy. A repeat review must report zero findings before the result can be PASS.
