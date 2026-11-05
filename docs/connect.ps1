# AgentSentinel 1-Click PowerShell Connector
# Usage: irm https://sparkysolutions10-pixel.github.io/agentsentinel/connect.ps1 | iex

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  🛡️  AGENTSENTINEL CLOUD DEFENSE -- 1-CLICK CLAUDE DESKTOP CONNECTOR" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$platform = [System.Environment]::OSVersion.Platform
$configPath = ""

if ($platform -eq "Win32NT") {
    $configPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
} elseif ($IsMacOS) {
    $configPath = [System.IO.Path]::Combine($env:HOME, "Library/Application Support/Claude/claude_desktop_config.json")
} else {
    $configPath = [System.IO.Path]::Combine($env:HOME, ".config/Claude/claude_desktop_config.json")
}

$configDir = Split-Path $configPath -Parent
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$config = @{ mcpServers = @{} }
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $backupPath = "$configPath.backup.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds)"
        Copy-Item -Path $configPath -Destination $backupPath -Force
        Write-Host "  [+] Backup created: $backupPath" -ForegroundColor Gray
    } catch {
        $config = @{ mcpServers = @{} }
    }
}

if (-not $config.mcpServers) {
    $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
}

$sentinelEntry = [ordered]@{
    url = "https://agentsentinel-production.up.railway.app/sse"
    headers = [ordered]@{
        Authorization = "Bearer sk_demo_pixel_2026"
    }
}

if ($config.mcpServers -is [PSCustomObject]) {
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name "agentsentinel" -Value $sentinelEntry -Force
} else {
    $config.mcpServers["agentsentinel"] = $sentinelEntry
}

$config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding utf8

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  ✅ SUCCESS! AgentSentinel Cloud is now CONNECTED to Claude Desktop!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  • Target Path: $configPath" -ForegroundColor White
Write-Host "  • Cloud URL:   https://agentsentinel-production.up.railway.app/sse" -ForegroundColor White
Write-Host ""
Write-Host "  [!] Please RESTART Claude Desktop to activate AgentSentinel!" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Green
