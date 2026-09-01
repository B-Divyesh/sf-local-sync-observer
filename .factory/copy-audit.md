# Copy audit — Local Sync Observer

Date: 2026-09-01. The audit covers every prose sentence in the landing page and README. Labels, commands, URLs, table values, and image alternatives are excluded. All counted sentences are 22 words or fewer.

## Landing page

| Words | Sentence |
| ---: | --- |
| 6 | Check what synced after offline work. |
| 18 | For people using Syncthing who need to see pending files, conflicts, and local device status in one place. |
| 11 | Try the sample first, or download a build for your computer. |
| 4 | Downloads are being published. |
| 5 | Open the release page. |
| 7 | The observer sits outside your data path. |
| 8 | It sees evidence; it never moves a file. |
| 11 | After reconnecting, “idle” does not always mean every device agrees. |
| 18 | Local Sync Observer turns each provider’s evidence into a careful reading and refuses to call folder metadata alone “synced.” |
| 9 | Add a loopback Syncthing API or choose a folder. |
| 9 | Credentials and paths stay in the app’s local storage. |
| 16 | See pending counts, known conflict-copy names, last-good checks, and exactly what the provider did not report. |
| 8 | Open the owning tool from the affected row. |
| 8 | The observer never resolves, renames, or deletes anything. |
| 8 | See the reading before you connect anything. |
| 11 | The empty board asks for evidence before it reports a status. |
| 11 | Add a local Syncthing endpoint or choose folder metadata. |
| 11 | The board shows the conflict and explains what the evidence proves. |
| 10 | If an integration cannot prove convergence, the board says so. |
| 14 | Every status includes its evidence coverage, so a reassuring color never outruns the facts. |
| 7 | Folder observation can detect common conflict copies. |
| 7 | Only provider-reported pending counts can establish “Converged.” |
| 15 | Reads local REST folder configuration and `needFiles`; scans configured folder names for common conflict copies. |
| 13 | Reads names, sizes, and timestamps only, capped at 50,000 entries and 16 levels. |
| 4 | Never opens file content. |
| 11 | Use folder observation to look for common conflict-copy names. |
| 9 | It does not report a provider’s pending work. |
| 9 | Choose a build for your platform. |
| 13 | The release page includes install details for each operating system. |
| 12 | The one-line installers verify the downloaded file before installing or opening it. |

## README

| Words | Sentence |
| ---: | --- |
| 8 | Local Sync Observer checks Syncthing after offline work. |
| 10 | It shows whether your folders and devices finished syncing. |
| 8 | It observes sync evidence and does not sync files. |
| 9 | It reads Syncthing status and selected folder metadata. |
| 9 | It never opens file contents or changes a file. |
| 11 | When something needs attention, it opens the owning tool for the fix. |
| 7 | The sample uses a separate browser key. |
| 9 | It never reads or changes real observer data. |
| 6 | The scripts fetch the release manifest. |
| 10 | They verify the downloaded file before installation or opening it. |
| 10 | See the release page for operating-system install details. |
| 11 | You can also choose a folder for metadata-only observation. |
| 10 | The board checks again every 30 seconds while running. |
| 12 | Review the coverage note. Use Open owning tool to resolve a finding there. |
| 9 | Syncthing endpoints must be loopback addresses or `.local` hosts. |
| 15 | Folder scans inspect names and metadata for at most 50,000 entries and 16 levels. |
| 8 | Folder scans can flag common conflict copies. |
| 8 | They do not prove convergence without provider evidence. |
| 18 | Tauri development also needs the Tauri 2 system dependencies for your operating system. |
| 13 | The release workflow runs on `v*` tags and manual dispatch. |
| 9 | It builds macOS, Windows, and Linux packages. |
| 12 | It publishes `SHA256SUMS` and `latest.json` with the tagged source commit. |
| 10 | The landing page asks GitHub which release is current. |
| 10 | If GitHub is unavailable, it links to the release page. |
| 13 | Source labels, paths, endpoints, API keys, and readings stay in the app’s local storage. |
| 7 | API keys stay on this device. |
| 7 | Version 0.1 does not encrypt them. |
| 5 | Use a separate Syncthing key. |
| 9 | Remove the source when you no longer need it. |
| 7 | The website has no analytics or cookies. |

## Terminology

| Concept | One term |
| --- | --- |
| Product result | reading |
| Connected integration | source |
| App that owns data | owning tool |
| Example environment | sample demo |
| Cannot prove convergence | unknown |
| Provider-backed completed state | converged |
