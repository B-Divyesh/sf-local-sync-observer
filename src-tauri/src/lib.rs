use local_sync_observer_core::{
    now_ms, probe_syncthing as read_syncthing, read_folder, tray_tooltip, SourceReading,
};
use tauri::{Manager, WindowEvent};

#[tauri::command]
async fn probe_syncthing(
    source_id: String,
    name: String,
    endpoint: String,
    api_key: String,
) -> Result<SourceReading, String> {
    tauri::async_runtime::spawn_blocking(move || read_syncthing(source_id, name, endpoint, api_key))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
fn inspect_folder(source_id: String, name: String, path: String) -> Result<SourceReading, String> {
    let folder = read_folder(source_id.clone(), name, path, None)?;
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

#[tauri::command]
fn update_tray_status(
    app: tauri::AppHandle,
    state: String,
    attention_count: usize,
) -> Result<(), String> {
    let tray = app
        .tray_by_id("status-tray")
        .ok_or_else(|| "Tray icon is unavailable.".to_string())?;
    tray.set_tooltip(Some(tray_tooltip(&state, attention_count)))
        .map_err(|error| error.to_string())
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
            let mut tray = TrayIconBuilder::with_id("status-tray");
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.menu(&menu)
                .tooltip(tray_tooltip("unknown", 0))
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
        .invoke_handler(tauri::generate_handler![
            probe_syncthing,
            inspect_folder,
            update_tray_status
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Local Sync Observer");
}
