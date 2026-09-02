//! Read-only checks shared by the desktop observer and its claim tests.
//! Folder scans never open file contents. The Syncthing probe performs GET requests only.

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use url::Url;

pub const SCAN_MAX_ENTRIES: u64 = 50_000;
pub const SCAN_MAX_DEPTH: usize = 16;
pub const NEXTCLOUD_LOG_MAX_BYTES: u64 = 2 * 1024 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FolderScan {
    pub conflict_files: u64,
    pub newest_change_at: Option<u64>,
    pub truncated: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderReading {
    pub id: String,
    pub label: String,
    pub path: String,
    pub state: String,
    pub pending_files: Option<u64>,
    pub conflict_files: u64,
    pub last_good_at: Option<u64>,
    pub newest_change_at: Option<u64>,
    pub note: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceReading {
    pub source_id: String,
    pub provider: String,
    pub state: String,
    pub checked_at: u64,
    pub summary: String,
    pub folders: Vec<FolderReading>,
    pub coverage: String,
}

#[derive(Debug, Deserialize)]
struct SyncthingFolder {
    id: String,
    #[serde(default)]
    label: String,
    path: String,
    #[serde(default)]
    devices: Vec<SyncthingFolderDevice>,
}

#[derive(Debug, Deserialize)]
struct SyncthingFolderDevice {
    #[serde(rename = "deviceID")]
    device_id: String,
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

pub fn is_conflict_name(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    lower.contains(".sync-conflict-")
        || lower.contains("conflicted copy")
        || lower.contains("conflict copy")
        || lower.ends_with(".conflict")
}

pub fn is_local_endpoint(endpoint: &str) -> bool {
    let Some((scheme, rest)) = endpoint.split_once("://") else {
        return false;
    };
    if scheme != "http" && scheme != "https" {
        return false;
    }
    let authority = rest.split('/').next().unwrap_or_default();
    let host_port = authority.rsplit('@').next().unwrap_or_default();
    let host = if host_port.starts_with('[') {
        host_port
            .trim_start_matches('[')
            .split(']')
            .next()
            .unwrap_or_default()
    } else {
        host_port.split(':').next().unwrap_or_default()
    };
    host == "localhost" || host == "127.0.0.1" || host == "::1" || host.ends_with(".local")
}

pub fn scan_folder(path: &Path) -> Result<FolderScan, String> {
    if !path.exists() {
        return Err(format!("Folder does not exist: {}", path.display()));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a folder: {}", path.display()));
    }

    let mut scan = FolderScan {
        conflict_files: 0,
        newest_change_at: None,
        truncated: false,
    };
    let mut inspected = 0_u64;
    scan_directory(path, 0, &mut inspected, &mut scan)?;
    Ok(scan)
}

pub fn read_folder(
    id: String,
    label: String,
    path: String,
    pending_files: Option<u64>,
) -> Result<FolderReading, String> {
    let metadata = scan_folder(Path::new(&path))?;
    let conflicts = metadata.conflict_files;
    let (state, last_good_at, note) = if conflicts > 0 {
        ("conflict", None, format!("Found {conflicts} filename(s) matching common conflict-copy patterns. File contents were not opened."))
    } else if pending_files.unwrap_or(0) > 0 {
        (
            "pending",
            None,
            "Syncthing reports work still pending. No conflict-copy filename was found."
                .to_string(),
        )
    } else if pending_files == Some(0) && !metadata.truncated {
        ("converged", Some(now_ms()), "Syncthing reports zero pending items, and this metadata scan found no conflict-copy filename.".to_string())
    } else {
        (
            "unknown",
            None,
            if metadata.truncated {
                "No conflict-copy filename was found in the first 50,000 entries. The capped check cannot show that syncing finished.".to_string()
            } else {
                "No conflict-copy filename was found. Folder metadata alone cannot show that syncing finished.".to_string()
            },
        )
    };
    Ok(FolderReading {
        id,
        label,
        path,
        state: state.into(),
        pending_files,
        conflict_files: conflicts,
        last_good_at,
        newest_change_at: metadata.newest_change_at,
        note,
    })
}

fn request_json(
    base: &Url,
    path: &str,
    query: &[(&str, &str)],
    api_key: &str,
) -> Result<serde_json::Value, String> {
    let mut url = base.join(path).map_err(|error| error.to_string())?;
    url.query_pairs_mut().extend_pairs(query.iter().copied());
    let response = minreq::get(url.as_str())
        .with_header("X-API-Key", api_key)
        .with_timeout(8)
        .send()
        .map_err(|error| format!("Syncthing is unreachable: {error}"))?;
    if response.status_code == 401 || response.status_code == 403 {
        return Err(
            "Syncthing rejected the API key. Copy a fresh key from Actions → Settings → General."
                .into(),
        );
    }
    if !(200..300).contains(&response.status_code) {
        return Err(format!(
            "Syncthing returned HTTP {} for {}.",
            response.status_code, path
        ));
    }
    serde_json::from_str(
        response
            .as_str()
            .map_err(|_| "Syncthing returned a non-text response.".to_string())?,
    )
    .map_err(|_| "Syncthing returned data in an unexpected format.".to_string())
}

/// Runs the production Syncthing reading used by the desktop command.
/// It sends GET requests to the chosen local endpoint and scans only folder metadata.
pub fn probe_syncthing(
    source_id: String,
    name: String,
    endpoint: String,
    api_key: String,
) -> Result<SourceReading, String> {
    if !is_local_endpoint(&endpoint) {
        return Err(
            "Use Syncthing on this computer or a .local address. Remote hosts are rejected.".into(),
        );
    }
    let base = Url::parse(&endpoint)
        .map_err(|_| "The Syncthing address is not a valid URL.".to_string())?;
    let configured: Vec<SyncthingFolder> =
        serde_json::from_value(request_json(&base, "/rest/config/folders", &[], &api_key)?)
            .map_err(|_| "Syncthing returned folder data in an unexpected format.".to_string())?;
    let connections = request_json(&base, "/rest/system/connections", &[], &api_key)
        .ok()
        .and_then(|value| value.get("connections").cloned());
    let mut readings = Vec::with_capacity(configured.len());
    for folder in configured {
        let status = request_json(
            &base,
            "/rest/db/status",
            &[("folder", &folder.id)],
            &api_key,
        )
        .ok();
        let local_pending = status
            .as_ref()
            .and_then(|value| value.get("needFiles"))
            .and_then(serde_json::Value::as_u64);
        let mut pending = local_pending;
        let mut completion_missing = false;
        let mut disconnected_devices = 0_u64;
        for device in &folder.devices {
            let connected = connections
                .as_ref()
                .and_then(|map| map.get(&device.device_id))
                .and_then(|value| value.get("connected"))
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false);
            if !connected {
                disconnected_devices += 1;
                continue;
            }
            let completion = request_json(
                &base,
                "/rest/db/completion",
                &[("device", &device.device_id), ("folder", &folder.id)],
                &api_key,
            )
            .ok();
            if let Some(remote_pending) = completion
                .as_ref()
                .and_then(|value| value.get("needItems"))
                .and_then(serde_json::Value::as_u64)
            {
                pending = Some(pending.unwrap_or(0) + remote_pending);
            } else {
                completion_missing = true;
            }
        }
        if completion_missing {
            pending = None;
        }
        let label = if folder.label.trim().is_empty() {
            folder.id.clone()
        } else {
            folder.label
        };
        match read_folder(folder.id.clone(), label, folder.path.clone(), pending) {
            Ok(mut reading) => {
                if disconnected_devices > 0 && reading.state != "conflict" {
                    reading.state = "offline".into();
                    reading.last_good_at = None;
                    reading.note = format!("{disconnected_devices} configured {} offline, so syncing cannot be confirmed. {}", if disconnected_devices == 1 { "device is" } else { "devices are" }, reading.note);
                }
                readings.push(reading);
            }
            Err(error) => readings.push(FolderReading {
                id: folder.id,
                label: "Unavailable folder".into(),
                path: folder.path,
                state: "error".into(),
                pending_files: pending,
                conflict_files: 0,
                last_good_at: None,
                newest_change_at: None,
                note: error,
            }),
        }
    }
    let conflicts: u64 = readings.iter().map(|reading| reading.conflict_files).sum();
    let pending: u64 = readings
        .iter()
        .filter_map(|reading| reading.pending_files)
        .sum();
    let has_error = readings.iter().any(|reading| reading.state == "error");
    let has_offline = readings.iter().any(|reading| reading.state == "offline");
    let all_reported = !readings.is_empty()
        && readings
            .iter()
            .all(|reading| reading.pending_files.is_some());
    let (state, summary) = if conflicts > 0 {
        (
            "conflict",
            format!(
                "{conflicts} conflict {} need attention",
                if conflicts == 1 { "file" } else { "files" }
            ),
        )
    } else if has_error {
        ("error", "One or more folders could not be inspected".into())
    } else if has_offline {
        (
            "offline",
            "A configured device is offline; syncing is not confirmed".into(),
        )
    } else if pending > 0 {
        (
            "pending",
            format!(
                "{pending} {} still pending",
                if pending == 1 { "item" } else { "items" }
            ),
        )
    } else if all_reported {
        (
            "converged",
            "Every reported folder has zero pending items".into(),
        )
    } else {
        (
            "unknown",
            "Not enough information to show that syncing finished".into(),
        )
    };
    Ok(SourceReading {
        source_id,
        provider: format!("Syncthing · {name}"),
        state: state.into(),
        checked_at: now_ms(),
        summary,
        folders: readings,
        coverage: "Syncthing folder and device pending counts, connection state, and a capped conflict-filename check. File contents are never read.".into(),
    })
}

/// Reads recent status records from a local Nextcloud Desktop log. This never
/// contacts a Nextcloud server or alters the log, the client, or synced files.
/// Nextcloud's desktop log does not contain a reliable pending-file count, so
/// that limit is made explicit in each returned reading.
pub fn probe_nextcloud_log(
    source_id: String,
    name: String,
    log_path: String,
) -> Result<SourceReading, String> {
    let path = Path::new(&log_path);
    let metadata = fs::metadata(path).map_err(|_| {
        "The Nextcloud desktop log could not be opened. Choose the current nextcloud.log file."
            .to_string()
    })?;
    if !metadata.is_file() {
        return Err("Choose the Nextcloud desktop log file, not a folder.".into());
    }
    let mut file = fs::File::open(path)
        .map_err(|error| format!("Could not read the Nextcloud desktop log: {error}"))?;
    let length = metadata.len();
    if length > NEXTCLOUD_LOG_MAX_BYTES {
        file.seek(SeekFrom::Start(length - NEXTCLOUD_LOG_MAX_BYTES))
            .map_err(|error| format!("Could not read the recent Nextcloud desktop log: {error}"))?;
    }
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|_| "The Nextcloud desktop log is not readable text.".to_string())?;

    let mut latest: Option<(&str, Option<u64>)> = None;
    let mut active_conflicts = 0_u64;
    for line in contents.lines() {
        let lower = line.to_ascii_lowercase();
        let event = if lower.contains("conflict") || lower.contains("conflicted") {
            Some("conflict")
        } else if [
            "network error",
            "connection refused",
            "could not connect",
            "host not found",
            "server unreachable",
            "is offline",
        ]
        .iter()
        .any(|needle| lower.contains(needle))
        {
            Some("offline")
        } else if [
            "still unsynced",
            "sync is running",
            "syncing",
            "pending",
            "waiting to sync",
        ]
        .iter()
        .any(|needle| lower.contains(needle))
        {
            Some("pending")
        } else if [
            "sync run took",
            "sync finished",
            "synchronization finished",
            "all sync folders are up to date",
            "all files are up to date",
        ]
        .iter()
        .any(|needle| lower.contains(needle))
        {
            Some("converged")
        } else {
            None
        };
        if let Some(event) = event {
            if event == "conflict" {
                active_conflicts += 1;
            } else {
                active_conflicts = 0;
            }
            latest = Some((event, parse_nextcloud_log_timestamp(line)));
        }
    }

    let (state, summary, last_good_at, note) = match latest {
        Some(("conflict", _)) => (
            "conflict",
            format!(
                "Nextcloud reported {active_conflicts} conflict {}",
                if active_conflicts == 1 { "message" } else { "messages" }
            ),
            None,
            "The latest Nextcloud desktop log status reports a conflict. Open Nextcloud to resolve it there.".to_string(),
        ),
        Some(("offline", _)) => (
            "offline",
            "Nextcloud reported that it cannot reach the server".to_string(),
            None,
            "The latest Nextcloud desktop log status is a connection problem. Pending-file counts are not available from this log.".to_string(),
        ),
        Some(("pending", _)) => (
            "pending",
            "Nextcloud reported sync activity still pending".to_string(),
            None,
            "The Nextcloud desktop log reports pending activity but not a reliable pending-file count.".to_string(),
        ),
        Some(("converged", timestamp)) => (
            "converged",
            "Nextcloud logged a completed sync".to_string(),
            timestamp,
            "The latest recognised Nextcloud desktop log status is a completed sync. Per-folder and pending-file details are not available from this log.".to_string(),
        ),
        _ => (
            "unknown",
            "The Nextcloud log does not show current sync status".to_string(),
            None,
            "No recognised Nextcloud conflict, pending, connection, or completed-sync status was found in the recent log.".to_string(),
        ),
    };
    let folder = FolderReading {
        id: "nextcloud-desktop-log".into(),
        label: "Nextcloud desktop client".into(),
        path: log_path,
        state: state.into(),
        pending_files: None,
        conflict_files: if state == "conflict" {
            active_conflicts
        } else {
            0
        },
        last_good_at,
        newest_change_at: metadata
            .modified()
            .ok()
            .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_millis() as u64),
        note,
    };
    Ok(SourceReading {
        source_id,
        provider: format!("Nextcloud desktop log · {name}"),
        state: state.into(),
        checked_at: now_ms(),
        summary,
        folders: vec![folder],
        coverage: "Nextcloud desktop log status: conflicts, connection problems, pending activity, and completed syncs. It does not provide reliable pending-file counts, per-folder details, or device state.".into(),
    })
}

fn parse_nextcloud_log_timestamp(line: &str) -> Option<u64> {
    let bytes = line.as_bytes();
    if bytes.len() < 19
        || !matches!(bytes.get(4), Some(b'-'))
        || !matches!(bytes.get(7), Some(b'-'))
        || !matches!(bytes.get(10), Some(b' ') | Some(b'T'))
        || !matches!(bytes.get(13), Some(b':'))
        || !matches!(bytes.get(16), Some(b':'))
    {
        return None;
    }
    let number = |start: usize, end: usize| {
        std::str::from_utf8(&bytes[start..end])
            .ok()?
            .parse::<i64>()
            .ok()
    };
    let (year, month, day, hour, minute, second) = (
        number(0, 4)?,
        number(5, 7)?,
        number(8, 10)?,
        number(11, 13)?,
        number(14, 16)?,
        number(17, 19)?,
    );
    if !(1..=12).contains(&month)
        || !(1..=31).contains(&day)
        || hour > 23
        || minute > 59
        || second > 59
    {
        return None;
    }
    let year = year - if month <= 2 { 1 } else { 0 };
    let era = if year >= 0 { year } else { year - 399 } / 400;
    let yoe = year - era * 400;
    let adjusted_month = month + if month > 2 { -3 } else { 9 };
    let day_of_year = (153 * adjusted_month + 2) / 5 + day - 1;
    let day_of_era = yoe * 365 + yoe / 4 - yoe / 100 + day_of_year;
    let days_since_epoch = era * 146_097 + day_of_era - 719_468;
    Some(((days_since_epoch * 86_400 + hour * 3_600 + minute * 60 + second) * 1_000) as u64)
}

pub fn tray_tooltip(state: &str, attention_count: usize) -> String {
    let label = match state {
        "converged" => "Converged",
        "pending" => "Pending",
        "conflict" => "Conflict",
        "offline" => "Offline",
        "error" => "Error",
        _ => "Unknown",
    };
    if attention_count > 0 {
        format!("Local Sync Observer — {label} · {attention_count} need attention")
    } else {
        format!("Local Sync Observer — {label}")
    }
}

fn scan_directory(
    path: &Path,
    depth: usize,
    inspected: &mut u64,
    scan: &mut FolderScan,
) -> Result<(), String> {
    if depth >= SCAN_MAX_DEPTH || scan.truncated {
        return Ok(());
    }
    let entries = fs::read_dir(path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    for entry in entries {
        if scan.truncated {
            break;
        }
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        let file_type = match entry.file_type() {
            Ok(file_type) if !file_type.is_symlink() => file_type,
            _ => continue,
        };
        *inspected += 1;
        if *inspected > SCAN_MAX_ENTRIES {
            scan.truncated = true;
            break;
        }
        let file_name = entry.file_name();
        if is_conflict_name(&file_name.to_string_lossy()) {
            scan.conflict_files += 1;
        }
        if let Ok(metadata) = entry.metadata() {
            if let Ok(modified) = metadata.modified() {
                if let Ok(since_epoch) = modified.duration_since(UNIX_EPOCH) {
                    let timestamp = since_epoch.as_millis() as u64;
                    scan.newest_change_at = Some(
                        scan.newest_change_at
                            .map_or(timestamp, |current| current.max(timestamp)),
                    );
                }
            }
            if file_type.is_dir() {
                scan_directory(&entry.path(), depth + 1, inspected, scan)?;
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::sync::{Arc, Mutex};
    use std::thread;

    fn fixture(name: &str) -> std::path::PathBuf {
        std::env::temp_dir().join(format!(
            "lso-core-{name}-{}",
            std::time::SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        ))
    }

    #[test]
    fn detects_common_conflict_names() {
        assert!(is_conflict_name(
            "notes.sync-conflict-20260828-120000-DEVICE.md"
        ));
        assert!(is_conflict_name(
            "notes (MacBook's conflicted copy 2026-08-28).md"
        ));
        assert!(!is_conflict_name("conflict-resolution-guide.md"));
    }

    #[test]
    fn claim_local_endpoint_only_rejects_remote_endpoints() {
        assert!(!is_local_endpoint("https://sync.example.com"));
        assert!(is_local_endpoint("http://127.0.0.1:8384"));
        assert!(is_local_endpoint("https://observer.local/status"));
    }

    #[test]
    fn claim_metadata_only_scan_preserves_contents_and_stays_unknown() {
        let root = fixture("metadata");
        fs::create_dir_all(&root).expect("create fixture folder");
        let ordinary = root.join("ordinary-note.txt");
        let contents = b"a .sync-conflict- marker inside content is not filename evidence";
        fs::write(&ordinary, contents).expect("write fixture file");
        let reading = scan_folder(&root).expect("scan succeeds");
        assert_eq!(reading.conflict_files, 0);
        assert_eq!(
            fs::read(&ordinary).expect("read fixture after scan"),
            contents
        );
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    #[test]
    fn claim_scan_bounds_are_fifty_thousand_entries_and_depth_sixteen() {
        assert_eq!(SCAN_MAX_ENTRIES, 50_000);
        assert_eq!(SCAN_MAX_DEPTH, 16);
        let root = fixture("depth");
        let mut nested = root.clone();
        for level in 0..SCAN_MAX_DEPTH {
            nested = nested.join(format!("level-{level}"));
        }
        fs::create_dir_all(&nested).expect("create deep fixture folder");
        fs::write(nested.join("deep.sync-conflict-20260830.txt"), b"unchanged")
            .expect("write deep fixture file");
        let reading = scan_folder(&root).expect("scan succeeds");
        assert_eq!(
            reading.conflict_files, 0,
            "entries deeper than 16 are not scanned"
        );
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    fn syncthing_fixture() -> (
        SourceReading,
        Vec<String>,
        std::path::PathBuf,
        BTreeMap<std::path::PathBuf, Vec<u8>>,
    ) {
        let root = fixture("syncthing-probe");
        let conflict = root.join("field-notes");
        let offline = root.join("archive");
        let converged = root.join("photos");
        let incomplete = root.join("drafts");
        for path in [&conflict, &offline, &converged, &incomplete] {
            fs::create_dir_all(path).expect("create fixture folder");
        }
        let conflict_file = conflict.join("notes.sync-conflict-20260901-DEVICE.md");
        let ordinary_file = converged.join("photo-index.txt");
        fs::write(&conflict_file, b"conflict fixture bytes").expect("write conflict fixture");
        fs::write(&ordinary_file, b"ordinary fixture bytes").expect("write ordinary fixture");
        let before: BTreeMap<_, _> = [
            (conflict_file.clone(), fs::read(&conflict_file).unwrap()),
            (ordinary_file.clone(), fs::read(&ordinary_file).unwrap()),
        ]
        .into_iter()
        .collect();

        let listener = TcpListener::bind("127.0.0.1:0").expect("bind local Syncthing fixture");
        let endpoint = format!("http://{}", listener.local_addr().unwrap());
        let requests = Arc::new(Mutex::new(Vec::<String>::new()));
        let captured = Arc::clone(&requests);
        let folders_json = serde_json::json!([
            {"id":"field","label":"Field notes","path":conflict,"devices":[{"deviceID":"CONNECTED"}]},
            {"id":"archive","label":"Archive","path":offline,"devices":[{"deviceID":"OFFLINE"}]},
            {"id":"photos","label":"Photos","path":converged,"devices":[{"deviceID":"CONNECTED"}]},
            {"id":"drafts","label":"Drafts","path":incomplete,"devices":[{"deviceID":"CONNECTED"}]}
        ]).to_string();
        let server = thread::spawn(move || {
            for _ in 0..9 {
                let (mut stream, _) = listener.accept().expect("accept fixture request");
                let mut bytes = [0_u8; 8192];
                let size = stream.read(&mut bytes).expect("read fixture request");
                let raw = String::from_utf8_lossy(&bytes[..size]);
                let line = raw.lines().next().unwrap_or_default().to_string();
                captured.lock().unwrap().push(line.clone());
                let target = line.split_whitespace().nth(1).unwrap_or_default();
                let body = if target.starts_with("/rest/config/folders") {
                    folders_json.clone()
                } else if target.starts_with("/rest/system/connections") {
                    r#"{"connections":{"CONNECTED":{"connected":true},"OFFLINE":{"connected":false}}}"#.into()
                } else if target.contains("/rest/db/status") && target.contains("folder=field") {
                    r#"{"needFiles":2}"#.into()
                } else if target.contains("/rest/db/status") {
                    r#"{"needFiles":0}"#.into()
                } else if target.contains("/rest/db/completion") && target.contains("folder=field")
                {
                    r#"{"needItems":3}"#.into()
                } else if target.contains("/rest/db/completion") && target.contains("folder=drafts")
                {
                    r#"{"completion":100}"#.into()
                } else {
                    r#"{"needItems":0}"#.into()
                };
                let response = format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", body.len(), body);
                stream
                    .write_all(response.as_bytes())
                    .expect("write fixture response");
            }
        });

        let reading = probe_syncthing(
            "source-1".into(),
            "Fixture".into(),
            endpoint,
            "read-only-key".into(),
        )
        .expect("production probe succeeds");
        server.join().expect("fixture server finishes");
        let captured = requests.lock().unwrap().clone();
        (reading, captured, root, before)
    }

    #[test]
    fn claim_syncthing_reading_reports_configured_folder_and_device_state() {
        let (reading, _, root, _) = syncthing_fixture();
        assert_eq!(
            reading.folders.len(),
            4,
            "all configured folders are returned"
        );
        assert_eq!(reading.state, "conflict", "a conflict has overall priority");
        assert_eq!(
            reading.folders[0].pending_files,
            Some(5),
            "local and connected-device pending items are added"
        );
        assert_eq!(reading.folders[0].state, "conflict");
        assert_eq!(
            reading.folders[1].state, "offline",
            "a disconnected device remains explicit"
        );
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    #[test]
    fn claim_reading_details_show_last_good_missing_fields_and_coverage() {
        let (reading, _, root, _) = syncthing_fixture();
        assert_eq!(reading.folders[0].last_good_at, None);
        assert_eq!(reading.folders[2].state, "converged");
        assert!(
            reading.folders[2].last_good_at.is_some(),
            "zero pending establishes the last good check"
        );
        assert_eq!(
            reading.folders[3].pending_files, None,
            "missing device details stay unreported"
        );
        assert_eq!(reading.folders[3].state, "unknown");
        assert!(reading.coverage.contains("pending counts"));
        assert!(reading.coverage.contains("File contents are never read"));
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    #[test]
    fn claim_observer_probe_is_get_only_and_does_not_change_files() {
        let (_, requests, root, before) = syncthing_fixture();
        assert!(
            requests.iter().all(|line| line.starts_with("GET ")),
            "the provider receives GET requests only"
        );
        for (path, bytes) in before {
            assert!(path.exists(), "fixture path remains present");
            assert_eq!(
                fs::read(path).unwrap(),
                bytes,
                "fixture bytes remain unchanged"
            );
        }
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    #[test]
    fn claim_nextcloud_desktop_log_reports_status_and_preserves_log() {
        let root = fixture("nextcloud-log");
        fs::create_dir_all(&root).expect("create fixture folder");
        let log = root.join("nextcloud.log");
        let cases = [
            (
                "2026-09-02 10:00:01,250 [ info nextcloud.sync ]: Sync run took 910 ms\n",
                "converged",
            ),
            (
                "2026-09-02 10:01:01,250 [ info nextcloud.sync ]: Sync is running; changes pending\n",
                "pending",
            ),
            (
                "2026-09-02 10:02:01,250 [ warning nextcloud.sync ]: Conflict while uploading field-notes.md\n",
                "conflict",
            ),
            (
                "2026-09-02 10:03:01,250 [ warning nextcloud.sync ]: Network error: server unreachable\n",
                "offline",
            ),
        ];
        for (contents, expected_state) in cases {
            fs::write(&log, contents).expect("write Nextcloud fixture log");
            let before = fs::read(&log).expect("read fixture before probe");
            let reading = probe_nextcloud_log(
                "nextcloud-fixture".into(),
                "Fixture Nextcloud".into(),
                log.display().to_string(),
            )
            .expect("Nextcloud log probe succeeds");
            assert_eq!(reading.state, expected_state);
            assert_eq!(reading.folders[0].pending_files, None);
            assert!(reading
                .coverage
                .contains("does not provide reliable pending-file counts"));
            if expected_state == "converged" {
                assert_eq!(reading.folders[0].last_good_at, Some(1_788_343_201_000));
            }
            assert_eq!(fs::read(&log).expect("read fixture after probe"), before);
        }
        fs::remove_dir_all(root).expect("remove fixture folder");
    }

    #[test]
    fn claim_tray_status_names_the_reading_without_file_details() {
        assert_eq!(
            tray_tooltip("converged", 0),
            "Local Sync Observer — Converged"
        );
        assert_eq!(
            tray_tooltip("conflict", 2),
            "Local Sync Observer — Conflict · 2 need attention"
        );
        assert!(!tray_tooltip("conflict", 2).contains("Field notes"));
    }
}
