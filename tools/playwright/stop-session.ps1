$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$stopPath = Join-Path $workspaceRoot '.codex-playwright-stop'

New-Item -ItemType File -Force -Path $stopPath | Out-Null
Write-Output "stop_signal=$stopPath"
