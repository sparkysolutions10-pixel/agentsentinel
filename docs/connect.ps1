# ==============================================================================
# AgentSentinel 1-Click Multi-Agent Connector (Claude Desktop + Cursor IDE)
# Usage: irm https://sparkysolutions10-pixel.github.io/agentsentinel/connect.ps1 | iex
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  [+] AGENTSENTINEL ZERO-TRUST AST DEFENSE -- 1-CLICK MULTI-AGENT CONNECTOR" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$platform = [System.Environment]::OSVersion.Platform
$endpointUrl = "https://agentsentinel-production.up.railway.app/sse"

# 1. Resolve Target Configuration Paths
$targets = @()

# Claude Desktop
$claudePath = ""
if ($platform -eq "Win32NT") {
    $claudePath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
} elseif ($IsMacOS) {
    $claudePath = [System.IO.Path]::Combine($env:HOME, "Library/Application Support/Claude/claude_desktop_config.json")
} else {
    $claudePath = [System.IO.Path]::Combine($env:HOME, ".config/Claude/claude_desktop_config.json")
}
$targets += @{ Name = "Claude Desktop"; Path = $claudePath; RestartMsg = "Restart Claude Desktop" }

# Cursor IDE (~/.cursor/mcp.json)
$userHome = if ($env:USERPROFILE) { $env:USERPROFILE } else { $env:HOME }
$cursorPath = Join-Path $userHome ".cursor\mcp.json"
if ($platform -ne "Win32NT") {
    $cursorPath = [System.IO.Path]::Combine($userHome, ".cursor/mcp.json")
}
$targets += @{ Name = "Cursor IDE"; Path = $cursorPath; RestartMsg = "Reload Cursor Window (Ctrl+Shift+P > Reload Window)" }

$configuredCount = 0

foreach ($target in $targets) {
    $targetName = $target.Name
    $filePath = $target.Path
    $parentDir = Split-Path $filePath -Parent

    Write-Host "  [*] Configuring $targetName..." -ForegroundColor White

    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $cfg = @{ mcpServers = @{} }
    if (Test-Path $filePath) {
        try {
            $raw = Get-Content $filePath -Raw -Encoding utf8
            if (-not [string]::IsNullOrWhiteSpace($raw)) {
                $cfg = $raw | ConvertFrom-Json
            }
            $backupPath = "$filePath.backup.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds)"
            Copy-Item -Path $filePath -Destination $backupPath -Force
            Write-Host "      [+] Backup saved: $backupPath" -ForegroundColor DarkGray
        } catch {
            $cfg = @{ mcpServers = @{} }
        }
    }

    if (-not $cfg.mcpServers) {
        $cfg | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
    }

    # 100% Keyless Standard - No fragile manual keys required
    $sentinelEntry = [ordered]@{
        url = $endpointUrl
    }

    if ($cfg.mcpServers -is [PSCustomObject]) {
        $cfg.mcpServers | Add-Member -MemberType NoteProperty -Name "agentsentinel" -Value $sentinelEntry -Force
    } else {
        $cfg.mcpServers["agentsentinel"] = $sentinelEntry
    }

    $cfg | ConvertTo-Json -Depth 10 | Set-Content -Path $filePath -Encoding utf8
    Write-Host "      [OK] Injected AgentSentinel into $filePath" -ForegroundColor Green
    $configuredCount++
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  SUCCESS! AgentSentinel Cloud is CONNECTED to your AI Workspaces ($configuredCount Tools)!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  * Cloud Endpoint: $endpointUrl" -ForegroundColor Cyan
Write-Host "  * Active Defense: Sub-2ms AST Firewall, 90% SmartProxy, Atomic Rollback" -ForegroundColor Gray
Write-Host ""
Write-Host "  Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Claude Desktop: Restart the application." -ForegroundColor White
Write-Host "   2. Cursor IDE:     Press Ctrl+Shift+P > Developer: Reload Window." -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
