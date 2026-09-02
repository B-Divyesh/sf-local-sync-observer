# Demo sandbox

- URL: `https://local-sync-observer.sociobot.in/?demo=1` redirects directly to the isolated `/demo/?demo=1` board.
- Sample: a realistic Syncthing-style `Field notes` conflict plus a Nextcloud `Shared research` pending-log entry. Both are fixed sample data.
- Reset: use **Reset demo** in the persistent banner. It deletes `demo:local-sync-observer.site.v1` and reloads the sample.
- Isolation: the browser demo uses `demo:local-sync-observer.site.v1`; the desktop sample mode uses `demo:local-sync-observer.v1`. Neither reads nor writes `local-sync-observer.v1`, the real observer namespace.
- Choose a download: the site clears its demo key before opening the download section. The desktop app clears its demo data before source setup.
- Offline: `/demo/` is included in the service-worker shell and is tested from its own browser context after first visit.
