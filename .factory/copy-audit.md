# Copy audit — Local Sync Observer

Generated from the current landing markup and README by `node scripts/copy-audit.mjs --write`. Words are whitespace-separated; hyphenated terms and URLs count once. Complete sentences ending in punctuation are listed below. Headings, controls, runtime fragments, URLs, and commands are audited separately.

## Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | Check what synced after offline work. | — |
| 2 | 17 | For people using Syncthing or Nextcloud who need pending work, conflicts, and connection status in one place. | — |
| 3 | 8 | Opens a sample conflict board; nothing is saved. | — |
| 4 | 6 | Choose a build for your computer. | — |
| 5 | 8 | This app runs on macOS, Windows, and Linux. | — |
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
| 32 | 4 | Downloads are being published. | — |
| 33 | 4 | Open releases on GitHub. | — |

## README sentences

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
| 31 | 8 | Prerequisites: Node.js 22, npm, and current stable Rust. | — |
| 32 | 12 | Tauri development also needs the Tauri 2 system dependencies on its website. | — |
| 33 | 8 | npm run build builds both dist/app and dist/site. | — |
| 34 | 10 | The release workflow runs on v* tags and manual dispatch. | — |
| 35 | 7 | It builds macOS, Windows, and Linux packages. | — |
| 36 | 10 | It publishes SHA256SUMS and latest.json with the tagged source commit. | — |
| 37 | 12 | The website shows downloads only when the release matches its source commit. | — |
| 38 | 8 | Otherwise, it links to the GitHub release page. | — |
| 39 | 7 | The one-click demo is documented in .factory/demo.md. | — |
| 40 | 11 | Its observable product promises and exact test commands are in .factory/claims.json. | — |
| 41 | 9 | The landing page asks GitHub which release is current. | — |
| 42 | 10 | If GitHub is unavailable, it links to the release page. | — |
| 43 | 15 | Source labels, paths, local addresses, API keys, and readings stay in the app’s local storage. | — |
| 44 | 6 | API keys stay on this device. | — |
| 45 | 6 | Version 0.1 does not encrypt them. | — |
| 46 | 5 | Use a separate Syncthing key. | — |
| 47 | 9 | Remove the source when you no longer need it. | — |
| 48 | 7 | The website has no analytics or cookies. | — |
| 49 | 9 | It removes cached GitHub release details after one hour. | — |
| 50 | 4 | See Privacy and Terms. | — |
| 51 | 5 | Licensed under the MIT License. | — |

## Headings and controls

- h1: Check what synced after offline work.
- h2: Why one sync reading helps
- h2: How the observer checks a source
- h3: Add a local source
- h3: Check the status and its limits
- h3: Open the sync tool
- h2: Sample conflict walkthrough
- h2: When the reading is unknown
- h2: Provider coverage and limits
- h3: Syncthing
- h3: Nextcloud desktop
- h3: Any local folder
- h2: Install Local Sync Observer
- h3: macOS
- h3: Windows
- h3: Linux
- Skip to main content
- LS/O Local Sync Observer
- Demo
- How it works
- Privacy
- Download
- Try it with sample data
- Download from GitHub
- View install options
- Open releases on GitHub (external site)
- Open releases on GitHub (external site)
- Open releases on GitHub (external site)
- Privacy
- Terms
- Source on GitHub (external site)

Runtime download variants are `Download for <operating system> from GitHub`, `<version> · <asset name>`, `Open releases on GitHub (external site)`, and the desktop-only handoff for Android and iPhone visitors.

## Terminology

| Concept | One term |
| --- | --- |
| Product result | reading |
| Connected integration | source |
| App that owns data | sync tool |
| Try-out mode | demo |
| Demo contents | sample data |
| Cannot show completion | unknown |
| Syncthing-backed completed state | converged |

All complete sentences contain 22 words or fewer and no banned marketing word.
