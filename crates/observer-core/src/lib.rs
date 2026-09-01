//! Pure, dependency-free checks shared by the desktop observer and its claim tests.
//! This crate never opens file contents and performs no network requests.

use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

pub const SCAN_MAX_ENTRIES: u64 = 50_000;
pub const SCAN_MAX_DEPTH: usize = 16;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FolderScan {
    pub conflict_files: u64,
    pub newest_change_at: Option<u64>,
    pub truncated: bool,
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
}
