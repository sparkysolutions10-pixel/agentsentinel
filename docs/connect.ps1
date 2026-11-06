# ==============================================================================
# AgentSentinel Universal 1-Click Multi-Agent Connector
# Targets: Claude Desktop, Cursor IDE, VS Code (Cline/Roo), Windsurf & Zed
# Usage: irm https://getagentsentinel.com/connect.ps1 | iex
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  [+] AGENTSENTINEL ZERO-TRUST AST DEFENSE -- UNIVERSAL 1-CLICK CONNECTOR" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$platform = [System.Environment]::OSVersion.Platform
$endpointUrl = "https://mcp.getagentsentinel.com/sse"
$userHome = if ($env:USERPROFILE) { $env:USERPROFILE } else { $env:HOME }

# 1. Resolve Target Configuration Paths for All 5 Major Environments
$targets = @()

# ① Claude Desktop
$claudePath = ""
if ($platform -eq "Win32NT") {
    $claudePath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
} elseif ($IsMacOS) {
    $claudePath = [System.IO.Path]::Combine($env:HOME, "Library/Application Support/Claude/claude_desktop_config.json")
} else {
    $claudePath = [System.IO.Path]::Combine($env:HOME, ".config/Claude/claude_desktop_config.json")
}
$targets += @{ Name = "Claude Desktop"; Path = $claudePath; Type = "npx"; RestartMsg = "Restart Claude Desktop" }

# ② Cursor IDE (~/.cursor/mcp.json)
$cursorPath = Join-Path $userHome ".cursor\mcp.json"
if ($platform -ne "Win32NT") {
    $cursorPath = [System.IO.Path]::Combine($userHome, ".cursor/mcp.json")
}
$targets += @{ Name = "Cursor IDE"; Path = $cursorPath; Type = "sse"; RestartMsg = "Reload Cursor (Ctrl+Shift+P > Reload Window)" }

# ③ VS Code (Cline Extension)
$clinePath = ""
if ($platform -eq "Win32NT") {
    $clinePath = Join-Path $env:APPDATA "Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"
} elseif ($IsMacOS) {
    $clinePath = [System.IO.Path]::Combine($env:HOME, "Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
} else {
    $clinePath = [System.IO.Path]::Combine($env:HOME, ".config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
}
$targets += @{ Name = "VS Code (Cline)"; Path = $clinePath; Type = "cline"; RestartMsg = "Reload VS Code Window" }

# ④ VS Code (Roo Code Extension)
$rooPath = ""
if ($platform -eq "Win32NT") {
    $rooPath = Join-Path $env:APPDATA "Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json"
} elseif ($IsMacOS) {
    $rooPath = [System.IO.Path]::Combine($env:HOME, "Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json")
} else {
    $rooPath = [System.IO.Path]::Combine($env:HOME, ".config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json")
}
$targets += @{ Name = "VS Code (Roo Code)"; Path = $rooPath; Type = "cline"; RestartMsg = "Reload VS Code Window" }

# ⑤ Codeium Windsurf (~/.codeium/windsurf/mcp_config.json)
$windsurfPath = Join-Path $userHome ".codeium\windsurf\mcp_config.json"
if ($platform -ne "Win32NT") {
    $windsurfPath = [System.IO.Path]::Combine($userHome, ".codeium/windsurf/mcp_config.json")
}
$targets += @{ Name = "Windsurf IDE"; Path = $windsurfPath; Type = "windsurf"; RestartMsg = "Restart Windsurf Editor" }

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

    # Inject exact native protocol per application schema
    $sentinelEntry = $null
    if ($target.Type -eq "npx") {
        $sentinelEntry = [ordered]@{
            command = "npx"
            args = @("-y", "@sparkysolutions/agentsentinel")
        }
    } elseif ($target.Type -eq "cline") {
        $sentinelEntry = [ordered]@{
            url = $endpointUrl
            alwaysAllow = @("sentinel_audit_command", "sentinel_audit_sql", "sentinel_scan_secrets")
        }
    } elseif ($target.Type -eq "windsurf") {
        $sentinelEntry = [ordered]@{
            serverUrl = $endpointUrl
        }
    } else {
        $sentinelEntry = [ordered]@{
            url = $endpointUrl
        }
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
Write-Host "  * Configured:     Claude Desktop, Cursor IDE, VS Code (Cline/Roo), Windsurf" -ForegroundColor White
Write-Host ""
Write-Host "  Next Steps: Restart Claude Desktop, Windsurf, or reload VS Code/Cursor window." -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Green
