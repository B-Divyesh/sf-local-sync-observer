# Local Sync Observer

Local Sync Observer checks Syncthing after offline work. It shows whether your folders and devices finished syncing.

It observes sync evidence and does not sync files. It reads Syncthing status and selected folder metadata. It never opens file contents or changes a file. When something needs attention, it opens the owning tool for the fix.

Live site: <https://local-sync-observer.sociobot.in>

Try the isolated sample before installing: <https://local-sync-observer.sociobot.in/demo/>. The sample uses a separate browser key. It never reads or changes real observer data.

## Install

Download the build for your operating system from the website. You can also run:

```sh
curl -fsSL https://local-sync-observer.sociobot.in/install.sh | sh
```

On Windows PowerShell:

```powershell
irm https://local-sync-observer.sociobot.in/install.ps1 | iex
```

The scripts fetch the release manifest. They verify the downloaded file before installation or opening it. See the release page for operating-system install details.

## Use

1. Open **Configure sources**.
2. Choose Syncthing and enter its local URL and API key. You can also choose a folder for metadata-only observation.
3. Select **Save and inspect**. The board checks again every 30 seconds while running.
4. Review the coverage note. Use **Open owning tool** to resolve a finding there.

Syncthing endpoints must be loopback addresses or `.local` hosts. Folder scans inspect names and metadata for at most 50,000 entries and 16 levels. Folder scans can flag common conflict copies. They do not prove convergence without provider evidence.

## Develop

Prerequisites: Node.js 22, npm, and current stable Rust. Tauri development also needs the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your operating system.

```sh
npm ci
npm run dev          # desktop UI in a browser
npm run dev:site     # landing site
npm run tauri dev    # complete native app
```

Build the static deployment with:

```sh
npm run build:site   # output: dist/site
```

`npm run build` builds both `dist/app` and `dist/site`.

## Test and verify

```sh
npm run check        # TypeScript, unit tests, app and site builds
npm run test:e2e     # Playwright desktop/mobile and axe checks
cargo test --manifest-path crates/observer-core/Cargo.toml
```

The release workflow runs on `v*` tags and manual dispatch. It builds macOS, Windows, and Linux packages. It publishes `SHA256SUMS` and `latest.json` with the tagged source commit.

## Demo and claims

The one-click demo is documented in [`.factory/demo.md`](.factory/demo.md). Its observable product promises and exact test commands are in [`.factory/claims.json`](.factory/claims.json). The landing page asks GitHub which release is current. If GitHub is unavailable, it links to the release page.

## Privacy and security

Source labels, paths, endpoints, API keys, and readings stay in the app’s local storage. API keys stay on this device. Version 0.1 does not encrypt them. Use a separate Syncthing key. Remove the source when you no longer need it. The website has no analytics or cookies. See [Privacy](https://local-sync-observer.sociobot.in/privacy/) and [Terms](https://local-sync-observer.sociobot.in/terms/).

## Project notes

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and original image provenance: [`.factory/design.md`](.factory/design.md)
- Build and verification handoff: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
