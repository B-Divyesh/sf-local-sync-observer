use local_sync_observer_core::{is_local_endpoint, scan_folder as scan_metadata};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{Manager, WindowEvent};
use url::Url;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FolderReading {
    id: String,
    label: String,
    path: String,
    state: String,
    pending_files: Option<u64>,
    conflict_files: u64,
    last_good_at: Option<u64>,
    newest_change_at: Option<u64>,
    note: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SourceReading {
    source_id: String,
    provider: String,
    state: String,
    checked_at: u64,
    summary: String,
    folders: Vec<FolderReading>,
    coverage: String,
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

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn scan_folder(
    id: String,
    label: String,
    path: String,
    pending_files: Option<u64>,
) -> Result<FolderReading, String> {
    let root = Path::new(&path);
    if !root.exists() {
        return Err(format!("Folder does not exist: {path}"));
    }
    if !root.is_dir() {
        return Err(format!("Path is not a folder: {path}"));
    }

    let metadata = scan_metadata(root)?;
    let conflicts = metadata.conflict_files;
    let newest = metadata.newest_change_at;
    let truncated = metadata.truncated;

    let (state, last_good_at, note) = if conflicts > 0 {
        ("conflict", None, format!("Found {conflicts} filename(s) matching common conflict-copy patterns. File contents were not opened."))
    } else if pending_files.unwrap_or(0) > 0 {
        (
            "pending",
            None,
            "The provider reports work still pending. No conflict-copy filename was found."
                .to_string(),
        )
    } else if pending_files == Some(0) && !truncated {
        ("converged", Some(now_ms()), "The provider reports zero pending items and this metadata scan found no conflict-copy filename.".to_string())
    } else {
        (
            "unknown",
            None,
            if truncated {
                "No conflict-copy filename was found in the first 50,000 entries. Coverage was capped, so convergence is unknown.".to_string()
            } else {
                "No conflict-copy filename was found. Folder metadata alone cannot prove convergence.".to_string()
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
        newest_change_at: newest,
        note,
    })
}

fn validate_local_endpoint(endpoint: &str) -> Result<Url, String> {
    let url = Url::parse(endpoint)
        .map_err(|_| "The Syncthing endpoint is not a valid URL.".to_string())?;
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err("Only HTTP or HTTPS Syncthing endpoints are supported.".into());
    }
    if !is_local_endpoint(endpoint) {
        return Err(
            "Use a loopback address or a .local host. Remote cloud endpoints are rejected.".into(),
        );
    }
    Ok(url)
}

#[tauri::command]
async fn probe_syncthing(
    source_id: String,
    name: String,
    endpoint: String,
    api_key: String,
) -> Result<SourceReading, String> {
    let base = validate_local_endpoint(&endpoint)?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|error| error.to_string())?;
    let folders_url = base
        .join("/rest/config/folders")
        .map_err(|error| error.to_string())?;
    let response = client
        .get(folders_url)
        .header("X-API-Key", &api_key)
        .send()
        .await
        .map_err(|error| format!("Syncthing is unreachable: {error}"))?;
    if response.status() == reqwest::StatusCode::UNAUTHORIZED
        || response.status() == reqwest::StatusCode::FORBIDDEN
    {
        return Err(
            "Syncthing rejected the API key. Copy a fresh key from Actions → Settings → General."
                .into(),
        );
    }
    if !response.status().is_success() {
        return Err(format!(
            "Syncthing returned HTTP {} while listing folders.",
            response.status()
        ));
    }
    let configured: Vec<SyncthingFolder> = response
        .json()
        .await
        .map_err(|_| "Syncthing returned folder data in an unexpected format.".to_string())?;
    let connections = {
        let url = base
            .join("/rest/system/connections")
            .map_err(|error| error.to_string())?;
        match client.get(url).header("X-API-Key", &api_key).send().await {
            Ok(response) if response.status().is_success() => response
                .json::<serde_json::Value>()
                .await
                .ok()
                .and_then(|value| value.get("connections").cloned()),
            _ => None,
        }
    };
    let mut readings = Vec::with_capacity(configured.len());
    for folder in configured {
        let mut status_url = base
            .join("/rest/db/status")
            .map_err(|error| error.to_string())?;
        status_url
            .query_pairs_mut()
            .append_pair("folder", &folder.id);
        let status_response = client
            .get(status_url)
            .header("X-API-Key", &api_key)
            .send()
            .await;
        let local_pending = match status_response {
            Ok(response) if response.status().is_success() => response
                .json::<serde_json::Value>()
                .await
                .ok()
                .and_then(|value| value.get("needFiles").and_then(serde_json::Value::as_u64)),
            _ => None,
        };
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
            let mut completion_url = base
                .join("/rest/db/completion")
                .map_err(|error| error.to_string())?;
            completion_url
                .query_pairs_mut()
                .append_pair("device", &device.device_id)
                .append_pair("folder", &folder.id);
            match client
                .get(completion_url)
                .header("X-API-Key", &api_key)
                .send()
                .await
            {
                Ok(response) if response.status().is_success() => {
                    let remote_pending =
                        response
                            .json::<serde_json::Value>()
                            .await
                            .ok()
                            .and_then(|value| {
                                value.get("needItems").and_then(serde_json::Value::as_u64)
                            });
                    if let Some(remote_pending) = remote_pending {
                        pending = Some(pending.unwrap_or(0) + remote_pending);
                    } else {
                        completion_missing = true;
                    }
                }
                _ => completion_missing = true,
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
        match scan_folder(folder.id.clone(), label, folder.path.clone(), pending) {
            Ok(mut reading) => {
                if disconnected_devices > 0 && reading.state != "conflict" {
                    reading.state = "offline".into();
                    reading.last_good_at = None;
                    reading.note = format!(
                        "{disconnected_devices} configured {} offline, so convergence cannot be confirmed. {}",
                        if disconnected_devices == 1 { "device is" } else { "devices are" },
                        reading.note
                    );
                }
                readings.push(reading)
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
            "A configured device is offline; convergence is not confirmed".into(),
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
        ("unknown", "Not enough evidence to claim convergence".into())
    };
    Ok(SourceReading {
        source_id,
        provider: format!("Syncthing · {name}"),
        state: state.into(),
        checked_at: now_ms(),
        summary,
        folders: readings,
        coverage: "Syncthing local and connected-device needItems, connection state, plus a capped read-only conflict-filename scan; file contents are never read".into(),
    })
}

#[tauri::command]
fn inspect_folder(source_id: String, name: String, path: String) -> Result<SourceReading, String> {
    let folder = scan_folder(source_id.clone(), name, path, None)?;
    let state = folder.state.clone();
    let summary = if folder.conflict_files > 0 {
        format!(
            "{} conflict {} found",
            folder.conflict_files,
            if folder.conflict_files == 1 {
                "file"
            } else {
                "files"
            }
        )
    } else {
        "No known conflict copy found; convergence remains unknown".into()
    };
    Ok(SourceReading {
        source_id,
        provider: "Local folder metadata".into(),
        state,
        checked_at: now_ms(),
        summary,
        folders: vec![folder],
        coverage:
            "Names, timestamps, and metadata for up to 50,000 entries at depth 16; no file contents"
                .into(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::TrayIconBuilder;
            let show =
                MenuItem::with_id(app, "show", "Show convergence board", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let mut tray = TrayIconBuilder::new();
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.menu(&menu)
                .tooltip("Local Sync Observer")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![probe_syncthing, inspect_folder])
        .run(tauri::generate_context!())
        .expect("failed to run Local Sync Observer");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_syncthing_device_ids() {
        let folder: SyncthingFolder = serde_json::from_str(
            r#"{"id":"notes","path":"/notes","devices":[{"deviceID":"ABC-123"}]}"#,
        )
        .expect("valid Syncthing folder");
        assert_eq!(folder.devices[0].device_id, "ABC-123");
    }
}
