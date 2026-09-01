# First-read review 2 — Local Sync Observer

- Date: 2026-09-01 UTC
- Reviewed commit: `ee01672c67ce8d8bcc57977759a99916b1c9cd00`
- Live URL: `https://local-sync-observer.sociobot.in/`
- Fresh contexts: Chromium at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

`PASS` requires zero findings and no untested claim. This review records seven findings, including one blocking finding.

## First screen, before scrolling

The check passes at both viewport sizes.

| Question | Cold-visit answer |
| --- | --- |
| What does it do? | It checks whether Syncthing finished after offline work and shows pending files, conflicts, and device status. |
| For whom? | People who use Syncthing and work offline. |
| What should I click first? | **Try it with sample data**. |

At 390 × 844, the headline, audience sentence, sample action, download actions, release note, and three facts all appear before scrolling. The page has no horizontal overflow. The primary action opens the sample in one click. Evidence is in `.factory/review-2-evidence/mobile-cold.png` and `desktop-cold.png`.

## Findings

### F-2-1 — BLOCKING — core live promises remain outside the claim registry

**Locations and exact copy:**

- Landing headline: **“Check what synced after offline work.”**
- Landing audience sentence: **“For people using Syncthing who need to see pending files, conflicts, and local device status in one place.”**
- Landing facts: **“Reads status, not file contents”** and **“No account or telemetry”**. The existing claims cover folder-scan contents and telemetry, but not the broader status-reader or no-account statements.
- Landing context: **“After reconnecting, ‘idle’ does not always mean every device agrees.”**
- Landing method: **“See pending counts, known conflict-copy names, last-good checks, and exactly what the provider did not report.”**
- Landing method: **“The observer never resolves, renames, or deletes anything.”**
- Landing evidence limits: **“Every status includes its evidence coverage, so a reassuring color never outruns the facts.”**
- Landing Syncthing coverage: **“Reads local REST folder configuration and `needFiles`; scans configured folder names for common conflict copies.”**
- Landing install section: **“The release page includes install details for each operating system.”**
- README: **“It reads Syncthing status and selected folder metadata.”**
- README: **“It never opens file contents or changes a file.”**

**Check:** all 16 registered commands pass, but none invokes the production `probe_syncthing` path against a controlled local Syncthing response. The registered `evidence-boundary` test starts with already-created folder readings. The registered folder-scan test confirms byte preservation for one ordinary file, but it does not confirm the app-wide “never resolves, renames, or deletes” promise. No registered test confirms pending counts, last-good values, incomplete provider fields, or coverage text in a real reading.

This reopens F-1-2, which remains the history-tracking ID for the incomplete registry. The exact claims named in review 1 were removed or registered, but the current live page still contains material unlisted claims. A first-time visitor is being asked to rely on the product’s core result without a matching sandbox check.

**Concrete fix:** add separate `claims.json` entries for the Syncthing reading, reading details, and app-wide non-changing behavior. Use a controlled local Syncthing fixture to run the production probe and confirm configured folders, local and device pending items, disconnected devices, conflict priority, last-good values, coverage text, GET-only provider requests, and unchanged fixture paths and bytes. Alternatively, narrow the public copy to the outcomes already covered by registered tests.

### F-2-2 — HIGH — the Windows installer promise is broader than its registered claim check

**Locations and exact copy:**

- Landing: **“The one-line installers verify the downloaded file before installing or opening it.”**
- README: **“They verify the downloaded file before installation or opening it.”**

**Check:** `checksum-install` passes, but its tagged test runs only `public/install.sh`. A separate PowerShell ordering test exists, but `npm test -- --testNamePattern @claim:checksum-install` filters it out because that test has no claim tag. The plural live promise therefore includes Windows behavior that the registered command does not check.

**Concrete fix:** add `@claim:checksum-install` to a PowerShell execution check that covers both a mismatched and matching file, or split the Windows behavior into its own claim and registered command. If PowerShell cannot be run in the clean verifier, change the landing and README copy to name only the checked shell installer.

### F-2-3 — HIGH — the tray does not show the status it is observing

**Location:** `src-tauri/src/lib.rs`, tray setup.

**Check:** the brief calls for a local tray app that helps a person notice pending or conflicting work. The implemented tray has a static tooltip and only **Show convergence board** and **Quit**. The 30-second checks continue while the window is hidden, but the tray does not show the overall reading or notify the user when a new conflict appears. A normal person must reopen the window to learn whether anything changed.

**Concrete fix:** update the tray icon, tooltip, or menu with `Converged`, `Pending`, `Conflict`, or `Unknown`. Notify only when a reading changes to a state needing attention, and let that notification open the affected source. Keep filenames and paths out of notifications by default. Register and check this observable behavior with deterministic fixture readings.

### F-2-4 — MEDIUM — several headings and sentences require technical interpretation

No sentence exceeds 22 words, and no banned marketing word appears. These items still fail the plain-language and out-of-context heading checks:

| Location | Current copy | Why it is unclear | Proposed copy |
| --- | --- | --- | --- |
| Hero art label | `FIG. 01 — CONVERGENCE / INSPECTION` | Decorative label; “convergence” is undefined. | Remove it, or use `How three folders reach one sync reading`. |
| Hero caption | `The observer sits outside your data path.` | “Data path” is technical shorthand. | `The observer checks sync status without handling your files.` |
| How it works, h3 | `Connect local evidence` | Does not name the action in familiar words. | `Add a local source` |
| How it works, h3 | `Read the boundary` | Metaphor; it does not name the result. | `Check the status and its limits` |
| How it works, h3 | `Fix it at the source` | “Source” can mean a configured source or source code. | `Open the sync tool` |
| Walkthrough heading | `See the reading before you connect anything.` | It describes an invitation, not the section. | `Sample conflict walkthrough` |
| Walkthrough caption | `Start with no claim` | “Claim” is internal QA language. | `Start with no sync status` |
| Evidence sentence | `Every status includes its evidence coverage, so a reassuring color never outruns the facts.` | “Evidence coverage” is jargon and “outruns the facts” is a metaphor. | `Every status lists the checks it used and the provider details it could not read.` |
| Coverage sentence | `Reads local REST folder configuration and needFiles…` | `REST` and `needFiles` are implementation names. | `Reads Syncthing’s local folder list and pending-file count. It also checks folder names for conflict copies.` |
| README use | `Syncthing endpoints must be loopback addresses or .local hosts.` | “Loopback” and “endpoint” are unexplained. | `Use Syncthing on this computer, such as http://127.0.0.1:8384, or a .local address.` |
| README use | `They do not prove convergence without provider evidence.` | “Convergence” and “provider evidence” are unexplained. | `They do not show that syncing finished unless Syncthing reports no files waiting.` |
| README heading | `Use` | It is ambiguous in a heading list. | `Use Local Sync Observer` |
| README heading | `Develop` | It is ambiguous in a heading list. | `Develop Local Sync Observer` |
| README heading | `Project notes` | It does not name the files below it. | `Scope and design files` |
| Demo action | `Start for real` | It does not name the result of following the link. | `Choose a download` |

The same concept is also named **sample**, **sample data**, **isolated sample**, **sample demo**, and **demo**. Use **demo** for the mode and **sample data** only for its contents.

### F-2-5 — MEDIUM — the first screen does not explain the sample result or state the offline fact

**Location:** landing first screen.

**Check:** the primary action is clear, but the adjacent live note becomes **“v0.1.3 · Local.Sync.Observer_0.1.3_amd64.AppImage · SHA-256 published”** after release metadata loads. It no longer says what **Try it with sample data** will open. The three facts cover file access, account/telemetry, and price/license; none states offline behavior. The required first-screen shape calls for the action result plus privacy, offline, and price facts.

**Concrete fix:** place persistent text beside the primary action: **“Opens a sample conflict board; nothing is saved.”** Keep release status in a separate download note. Use **“Demo reloads offline after your first visit”**, **“No account or telemetry”**, and **“Free under the MIT License”** as the three facts; the offline statement is already registered by `offline-demo-reload`.

### F-2-6 — LOW — external links do not say that they leave the product site

**Locations:** live release downloads, footer **Source**, Privacy **public issue tracker**, and README external links.

**Check:** these links return 200, but their visible or accessible names do not identify GitHub or say that they open another site. The site-structure check requires external links to say so.

**Concrete fix:** name destinations directly, such as **“Download AppImage from GitHub”**, **“Source on GitHub”**, and **“GitHub issue tracker”**. Add a visually hidden **“(external site)”** suffix where the visible label must remain short.

### F-2-7 — LOW — the committed copy audit contains incorrect counts and omits README sentences

**Location:** `.factory/copy-audit.md`.

**Check:** examples include **“Choose a build for your platform.”** recorded as 9 words instead of 6, and **“It observes sync evidence and does not sync files.”** recorded as 8 instead of 9. The audit also omits complete README sentences such as **“Download the build for your operating system from the website.”** This weakens the required proof of simplicity even though no current sentence exceeds the cap.

**Concrete fix:** generate counts from rendered text with one documented token rule, include all complete sentences, and keep headings, controls, and runtime variants in separate audited tables.

## Demo and sandbox checks

The demo checks pass.

- Confirmed that **Try it with sample data** opens `/demo/` in one click.
- Confirmed that the first demo screen already shows a `Field notes` conflict with realistic Syncthing-style evidence.
- Confirmed the persistent **“Demo — sample data, nothing is saved to your real observer.”** banner, **Reset demo**, and **Start for real** controls.
- Seeded `local-sync-observer.v1` with a sentinel. Reset changed only `demo:local-sync-observer.site.v1`; the sentinel remained unchanged.
- Confirmed that leaving the demo removes its key and preserves the real-data sentinel.
- Recorded only `https://local-sync-observer.sociobot.in` requests during the demo flow.
- Confirmed an offline reload after the first visit in a dedicated browser context.

The landing page requested only its own origin and the disclosed GitHub release API. It set no cookies and logged no page or script error.

## Registered claims

Each exact command ran independently from a clean checkout at the reviewed commit.

| Claim | Result |
| --- | --- |
| `release-downloads` | PASS |
| `release-matrix` | PASS |
| `checksum-install` | PASS, with the plural-copy coverage issue in F-2-2 |
| `evidence-boundary` | PASS |
| `metadata-only-scan` | PASS |
| `scan-bounds` | PASS |
| `local-endpoint-only` | PASS |
| `local-app-storage` | PASS |
| `open-owner` | PASS |
| `thirty-second-refresh` | PASS |
| `site-private` | PASS |
| `mit-license` | PASS |
| `isolated-demo` | PASS |
| `demo-private` | PASS |
| `offline-demo-reload` | PASS |
| `release-fallback` | PASS |

`npm run check` passed: 11 Vitest checks and both production builds. `npm run test:e2e` passed 40/40 checks. The core issue is the unregistered public promises in F-2-1, not a failure among the registered commands.

## Copy audit

Counts use visible whitespace-separated words; hyphenated compounds count as one word. URLs, commands, navigation labels, buttons, and fragments are listed separately. No complete sentence is over 22 words.

### Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | Check what synced after offline work. | F-2-1 |
| 2 | 18 | For people using Syncthing who need to see pending files, conflicts, and local device status in one place. | F-2-1 |
| 3 | 11 | Try the sample first, or download a build for your computer. | Terminology, F-2-4 |
| 4 | 4 | Downloads are being published. | — |
| 5 | 4 | Open the release page. | — |
| 6 | 7 | The observer sits outside your data path. | F-2-4 |
| 7 | 8 | It sees evidence; it never moves a file. | F-2-1 |
| 8 | 10 | After reconnecting, “idle” does not always mean every device agrees. | F-2-1 |
| 9 | 18 | Local Sync Observer turns each provider’s evidence into a careful reading—and refuses to call folder metadata alone “synced.” | Jargon, F-2-4 |
| 10 | 9 | Add a loopback Syncthing API or choose a folder. | Jargon, F-2-4 |
| 11 | 9 | Credentials and paths stay in the app’s local storage. | — |
| 12 | 16 | See pending counts, known conflict-copy names, last-good checks, and exactly what the provider did not report. | F-2-1 |
| 13 | 8 | Open the owning tool from the affected row. | — |
| 14 | 8 | The observer never resolves, renames, or deletes anything. | F-2-1 |
| 15 | 7 | See the reading before you connect anything. | Heading, F-2-4 |
| 16 | 11 | The empty board asks for evidence before it reports a status. | — |
| 17 | 9 | Add a local Syncthing endpoint or choose folder metadata. | Jargon, F-2-4 |
| 18 | 11 | The board shows the conflict and explains what the evidence proves. | — |
| 19 | 10 | If an integration cannot prove convergence, the board says so. | Jargon, F-2-4 |
| 20 | 14 | Every status includes its evidence coverage, so a reassuring color never outruns the facts. | F-2-1, F-2-4 |
| 21 | 7 | Folder observation can detect common conflict copies. | F-2-1 |
| 22 | 7 | Only provider-reported pending counts can establish “Converged.” | Jargon, F-2-4 |
| 23 | 15 | Reads local REST folder configuration and `needFiles`; scans configured folder names for common conflict copies. | F-2-1, F-2-4 |
| 24 | 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. | — |
| 25 | 4 | Never opens file content. | — |
| 26 | 9 | Use folder observation to look for common conflict-copy names. | Jargon, F-2-4 |
| 27 | 8 | It does not report a provider’s pending work. | — |
| 28 | 6 | Choose a build for your platform. | — |
| 29 | 10 | The release page includes install details for each operating system. | F-2-1 |
| 30 | 6 | Apple silicon and Intel disk images. | — |
| 31 | 3 | 64-bit Windows installer. | — |
| 32 | 4 | AppImage and Debian package. | — |
| 33 | 12 | The one-line installers verify the downloaded file before installing or opening it. | F-2-2 |

The successful-release runtime note is a fragment: `v0.1.3 · Local.Sync.Observer_0.1.3_amd64.AppImage · SHA-256 published`. The three fact lines are also fragments; F-2-1 flags the two with incomplete claim coverage. The fallback contributes rows 4 and 5.

### README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 8 | Local Sync Observer checks Syncthing after offline work. | F-2-1 |
| 2 | 10 | It shows whether your folders and devices finished syncing. | F-2-1 |
| 3 | 9 | It observes sync evidence and does not sync files. | F-2-1 |
| 4 | 8 | It reads Syncthing status and selected folder metadata. | F-2-1 |
| 5 | 9 | It never opens file contents or changes a file. | F-2-1 |
| 6 | 12 | When something needs attention, it opens the owning tool for the fix. | — |
| 7 | 3 | Live site: `https://local-sync-observer.sociobot.in`. | — |
| 8 | 7 | Try the isolated sample before installing: `https://local-sync-observer.sociobot.in/demo/`. | Terminology, F-2-4 |
| 9 | 7 | The sample uses a separate browser key. | Terminology, F-2-4 |
| 10 | 8 | It never reads or changes real observer data. | — |
| 11 | 10 | Download the build for your operating system from the website. | Omitted from prior audit, F-2-7 |
| 12 | 6 | The scripts fetch the release manifest. | Jargon, F-2-4 |
| 13 | 10 | They verify the downloaded file before installation or opening it. | F-2-2 |
| 14 | 8 | See the release page for operating-system install details. | — |
| 15 | 3 | Open **Configure sources**. | — |
| 16 | 10 | Choose Syncthing and enter its local URL and API key. | — |
| 17 | 9 | You can also choose a folder for metadata-only observation. | Jargon, F-2-4 |
| 18 | 4 | Select **Save and inspect**. | — |
| 19 | 10 | The board checks again every 30 seconds while running. | — |
| 20 | 4 | Review the coverage note. | — |
| 21 | 9 | Use **Open owning tool** to resolve a finding there. | — |
| 22 | 9 | Syncthing endpoints must be loopback addresses or `.local` hosts. | Jargon, F-2-4 |
| 23 | 15 | Folder scans inspect names and metadata for at most 50,000 entries and 16 levels. | — |
| 24 | 7 | Folder scans can flag common conflict copies. | F-2-1 |
| 25 | 8 | They do not prove convergence without provider evidence. | Jargon, F-2-4 |
| 26 | 8 | Prerequisites: Node.js 22, npm, and current stable Rust. | — |
| 27 | 13 | Tauri development also needs the Tauri 2 system dependencies for your operating system. | Developer context |
| 28 | 8 | `npm run build` builds both `dist/app` and `dist/site`. | Developer context |
| 29 | 10 | The release workflow runs on `v*` tags and manual dispatch. | Jargon, F-2-4 |
| 30 | 7 | It builds macOS, Windows, and Linux packages. | — |
| 31 | 10 | It publishes `SHA256SUMS` and `latest.json` with the tagged source commit. | Developer context |
| 32 | 7 | The one-click demo is documented in [`.factory/demo.md`](.factory/demo.md). | — |
| 33 | 11 | Its observable product promises and exact test commands are in [`.factory/claims.json`](.factory/claims.json). | — |
| 34 | 10 | The landing page asks GitHub which release is current. | — |
| 35 | 10 | If GitHub is unavailable, it links to the release page. | — |
| 36 | 13 | Source labels, paths, endpoints, API keys, and readings stay in the app’s local storage. | — |
| 37 | 7 | API keys stay on this device. | — |
| 38 | 7 | Version 0.1 does not encrypt them. | — |
| 39 | 5 | Use a separate Syncthing key. | — |
| 40 | 9 | Remove the source when you no longer need it. | — |
| 41 | 7 | The website has no analytics or cookies. | — |
| 42 | 4 | See [Privacy](https://local-sync-observer.sociobot.in/privacy/) and [Terms](https://local-sync-observer.sociobot.in/terms/). | — |
| 43 | 5 | Licensed under the [MIT License](LICENSE). | — |

README command introductions and project-file bullets are fragments, not sentences. No marketing adjective or banned word appears in either inventory.

### Headings, controls, and terminology

- The flagged landing headings and their rewrites are listed in F-2-4.
- Landing action labels **Try it with sample data**, **Download for Linux**, **View install options**, and the platform download labels name their results.
- Demo action **Start for real** does not name its result; use **Choose a download**.
- README headings **Use**, **Develop**, and **Project notes** need the specific replacements in F-2-4.
- Use **demo** for the mode, **sample data** for its contents, **source** for an observed integration, **reading** for a result, and **sync tool** for the app that owns the files.

## Earlier finding confirmation

| Earlier finding | Live and source confirmation |
| --- | --- |
| F-1-1 | Fixed. All three dependency-free Rust claim commands pass from the clean checkout. |
| F-1-2 | Reopened by F-2-1. The exact earlier quotes were removed or registered, but material core promises remain outside the registry. |
| F-1-3 | Fixed. Demo, Privacy, Terms, and the designed 404 include route-specific descriptions, canonicals, Open Graph, Twitter card, SVG favicon, and Apple touch icon. |
| F-1-4 | Fixed. Every checked route uses the same header links and footer links, one-liner, factory credit, and version. |
| F-1-5 | Fixed for the exact h2 and action labels named in review 1. F-2-4 records separate h3, walkthrough, and technical-copy issues found in the full new audit. |
| F-1-6 | Fixed for product resources and focus. The exact unknown URL returns the designed page with HTTP 404; its styles and scripts load; the h1 receives focus. Chromium records only its built-in main-document 404 status message, not a product script, style, CSP, or missing-resource error. |
| F-1-7 | Fixed for the three exact README sentences. F-2-7 records count and completeness errors in the updated audit artifact. |

## Structure, routing, links, and accessibility

- Confirmed route titles: `Local Sync Observer — check local sync status`, `Demo — Local Sync Observer`, `Privacy — Local Sync Observer`, `Terms — Local Sync Observer`, and `Page not found — Local Sync Observer`.
- Confirmed `lang="en"`, one h1, one main landmark, descriptions, canonicals, Open Graph data, Twitter cards, favicons, and the 1200 × 630 social image.
- Confirmed the shared header and footer on `/`, `/demo/`, `/privacy/`, `/terms/`, and an unknown URL.
- Confirmed the designed unknown-route page returns HTTP 404 and offers Home and Demo recovery actions.
- Confirmed direct loads, Back, and Forward restore the correct URL, scroll position, and focused h1.
- Confirmed `robots.txt`, `sitemap.xml`, the social image, SVG favicon, and Apple touch icon return 200.
- Confirmed all normal internal, GitHub source, issue, and release destinations return 200. F-2-6 covers missing external-link wording.
- Confirmed no serious or critical Axe findings on every checked live route at 390 px.
- Confirmed the visual identity is specific to this product: warm paper, hard rules, yellow inspection surface, offset shadows, original inspection-board art, and status words rather than a generic centered SaaS layout.

## Missed leverage and AI check

F-2-3 records the obvious missing tray-status behavior implied by the brief. Adding sync, file editing, or cloud monitoring would conflict with the stated product boundary. An AI feature would not improve this deterministic local status job, so none is expected. No model keys or provider calls appear in the product.

## What would make this perfect

Register and check the real Syncthing reading and every displayed reading detail; cover the PowerShell installer under its public claim; surface changing status from the tray; replace the listed jargon and metaphor copy; complete the required first-screen facts and action explanation; label external destinations; and regenerate the copy audit from complete rendered text. A repeat review can return `PASS` only when those checks produce zero findings.
