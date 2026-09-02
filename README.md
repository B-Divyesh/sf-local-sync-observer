# Local Sync Observer

Local Sync Observer checks Syncthing and Nextcloud after offline work. It shows whether your folders and devices finished syncing.

It observes sync status and does not sync files. It reads Syncthing status, Nextcloud desktop logs, and selected folder metadata. It never opens synced file contents or changes a file. When something needs attention, it opens the sync tool for the fix.

Live site: <https://local-sync-observer.sociobot.in>

Try the isolated demo before installing: <https://local-sync-observer.sociobot.in/?demo=1>. The demo keeps sample data separate from your saved settings. It never reads or changes real observer data.

## Install

Download the build for your operating system from the website. You can also run:

Local Sync Observer runs on macOS, Windows, and Linux, not Android or iPhone.

```sh
curl -fsSL https://local-sync-observer.sociobot.in/install.sh | sh
```

On Windows PowerShell:

```powershell
irm https://local-sync-observer.sociobot.in/install.ps1 | iex
```

The shell installer fetches the release file list. It checks the download before opening it. See [releases on GitHub](https://github.com/B-Divyesh/sf-local-sync-observer/releases) for install details.

## Use Local Sync Observer

1. Open **Configure sources**.
2. Choose Syncthing and enter its local address and API key. You can also choose a Nextcloud desktop log or folder check.
3. Select **Save and inspect**. The board checks again every 30 seconds while running.
4. Review the listed checks. Use **Open sync tool** to resolve a finding there.

The tray tooltip shows the current overall reading. It never includes filenames or paths.

Use Syncthing on this computer, such as `http://127.0.0.1:8384`, or a `.local` address. Nextcloud checks read its local desktop log. They show conflicts, connection problems, pending activity, and completed syncs. The log does not provide a reliable pending-file count. Folder checks inspect names and metadata for at most 50,000 entries and 16 levels. They can flag common conflict copies. They do not show that syncing finished unless Syncthing reports no files waiting.

## Develop Local Sync Observer

Prerequisites: Node.js 22, npm, and current stable Rust. Tauri development also needs the [Tauri 2 system dependencies on its website](https://v2.tauri.app/start/prerequisites/).

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

The website shows downloads only when the release matches its source commit. Otherwise, it links to the GitHub release page.

## Demo and claims

The one-click demo is documented in [`.factory/demo.md`](.factory/demo.md). Its observable product promises and exact test commands are in [`.factory/claims.json`](.factory/claims.json). The landing page asks GitHub which release is current. If GitHub is unavailable, it links to the release page.

## Privacy and security

Source labels, paths, local addresses, API keys, and readings stay in the app’s local storage. API keys stay on this device. Version 0.1 does not encrypt them. Use a separate Syncthing key. Remove the source when you no longer need it. The website has no analytics or cookies. It removes cached GitHub release details after one hour. See [Privacy](https://local-sync-observer.sociobot.in/privacy/) and [Terms](https://local-sync-observer.sociobot.in/terms/).

## Scope and design files

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and original image provenance: [`.factory/design.md`](.factory/design.md)
- Build and verification handoff: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
