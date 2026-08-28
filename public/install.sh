#!/bin/sh
set -eu

repo="B-Divyesh/sf-local-sync-observer"
manifest_url="https://github.com/$repo/releases/latest/download/latest.json"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT HUP INT TERM

case "$(uname -s)" in
  Darwin)
    case "$(uname -m)" in arm64) platform="macos-arm64" ;; *) platform="macos-x64" ;; esac
    ;;
  Linux) platform="linux-x64" ;;
  *) printf '%s\n' "Unsupported operating system. Use the release page: https://github.com/$repo/releases/latest" >&2; exit 1 ;;
esac

curl -fsSL "$manifest_url" -o "$tmp_dir/latest.json"
read_manifest() {
  python3 - "$tmp_dir/latest.json" "$platform" "$1" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as handle:
    print(json.load(handle)["platforms"][sys.argv[2]][sys.argv[3]])
PY
}
asset_url="$(read_manifest url)"
asset_name="$(read_manifest name)"
expected="$(read_manifest sha256)"
curl -fL "$asset_url" -o "$tmp_dir/$asset_name"

if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$tmp_dir/$asset_name" | awk '{print $1}')"; else actual="$(shasum -a 256 "$tmp_dir/$asset_name" | awk '{print $1}')"; fi
if [ "$actual" != "$expected" ]; then printf '%s\n' "Checksum mismatch; nothing was installed." >&2; exit 1; fi

if [ "$(uname -s)" = "Darwin" ]; then
  destination="$HOME/Downloads/$asset_name"
  cp "$tmp_dir/$asset_name" "$destination"
  printf '%s\n' "Verified SHA-256 and saved $destination"
  printf '%s\n' "Opening the unsigned disk image. Control-click the app and choose Open on first launch."
  open "$destination"
else
  destination="$HOME/.local/bin/local-sync-observer"
  mkdir -p "$HOME/.local/bin"
  cp "$tmp_dir/$asset_name" "$destination"
  chmod 755 "$destination"
  printf '%s\n' "Verified SHA-256 and installed $destination"
  printf '%s\n' "Run local-sync-observer (add $HOME/.local/bin to PATH if needed)."
fi
