# Demo sandbox

- URL: `https://local-sync-observer.sociobot.in/demo/`
- Sample: one realistic Syncthing-style `Field notes` conflict, with zero pending files and an explicit conflict-copy evidence boundary.
- Reset: use **Reset demo** in the persistent banner. It deletes `demo:local-sync-observer.site.v1` and reloads the sample.
- Isolation: the browser demo uses `demo:local-sync-observer.site.v1`; the desktop sample mode uses `demo:local-sync-observer.v1`. Neither reads nor writes `local-sync-observer.v1`, the real observer namespace.
- Start for real: the banner links to the download section. The desktop app’s **Start for real** action discards the sample before source setup.
- Offline: `/demo/` is included in the service-worker shell and is tested from its own browser context after first visit.
