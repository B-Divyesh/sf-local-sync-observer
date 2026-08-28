$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-local-sync-observer"
$manifestUrl = "https://github.com/$repo/releases/latest/download/latest.json"
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("local-sync-observer-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tempDir | Out-Null
try {
  $manifest = Invoke-RestMethod -Uri $manifestUrl
  $asset = $manifest.platforms.'windows-x64'
  if (-not $asset) { throw "The latest release does not include a Windows build." }
  $destination = Join-Path $tempDir $asset.name
  Invoke-WebRequest -Uri $asset.url -OutFile $destination
  $actual = (Get-FileHash -Algorithm SHA256 -Path $destination).Hash.ToLowerInvariant()
  if ($actual -ne $asset.sha256.ToLowerInvariant()) { throw "Checksum mismatch; nothing was installed." }
  Write-Host "Verified SHA-256 for $($asset.name). Starting the unsigned installer."
  if ($destination.EndsWith(".msi")) {
    Start-Process msiexec.exe -ArgumentList "/i `"$destination`"" -Wait
  } else {
    Start-Process $destination -Wait
  }
  Write-Host "Local Sync Observer installation finished."
} finally {
  Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
