@echo off
chcp 65001 >nul
title AgentSentinel 1-Click Claude Desktop Connector
color 0B

echo ==============================================================================
echo   🛡️  AGENTSENTINEL CLOUD DEFENSE -- 1-CLICK CLAUDE DESKTOP CONNECTOR
echo ==============================================================================
echo.
echo  [*] Detecting Claude Desktop configuration...

set "CLAUDE_DIR=%APPDATA%\Claude"
set "CONFIG_PATH=%CLAUDE_DIR%\claude_desktop_config.json"
set "BACKUP_PATH=%CLAUDE_DIR%\claude_desktop_config.backup.%random%.json"

if not exist "%CLAUDE_DIR%" (
    mkdir "%CLAUDE_DIR%" >nul 2>&1
)

if exist "%CONFIG_PATH%" (
    copy /y "%CONFIG_PATH%" "%BACKUP_PATH%" >nul 2>&1
    echo  [+] Existing configuration backed up.
)

echo  [*] Injecting AgentSentinel Hosted Cloud MCP Server...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$cfgPath = '%CONFIG_PATH%';" ^
  "$cfg = @{ mcpServers = @{} };" ^
  "if (Test-Path $cfgPath) { try { $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json } catch { $cfg = @{ mcpServers = @{} } } };" ^
  "if (-not $cfg.mcpServers) { $cfg | Add-Member -MemberType NoteProperty -Name 'mcpServers' -Value @{} -Force };" ^
  "$sentinelEntry = [ordered]@{ url = 'https://agentsentinel-production.up.railway.app/sse'; headers = [ordered]@{ Authorization = 'Bearer sk_demo_pixel_2026' } };" ^
  "if ($cfg.mcpServers -is [PSCustomObject]) { $cfg.mcpServers | Add-Member -MemberType NoteProperty -Name 'agentsentinel' -Value $sentinelEntry -Force } else { $cfg.mcpServers['agentsentinel'] = $sentinelEntry };" ^
  "$cfg | ConvertTo-Json -Depth 10 | Set-Content -Path $cfgPath -Encoding utf8;"

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo   ✅ SUCCESS! AgentSentinel Cloud is now CONNECTED to Claude Desktop!
    echo ==============================================================================
    echo   • Server:  https://agentsentinel-production.up.railway.app/sse
    echo   • Tools:   Blackbox Recorder, Atomic Rollback, 90%% Token-Saver SmartProxy
    echo.
    echo   [!] Next Step: Please RESTART Claude Desktop to start using your tools!
    echo ==============================================================================
    
    :: Show native Windows dialog box
    mshta vbscript:Execute("msgbox ""✅ SUCCESS! AgentSentinel Cloud Defense is now connected to Claude Desktop!"" & vbCrLf & vbCrLf & ""Please restart Claude Desktop to activate your tools."", 64, ""AgentSentinel 1-Click Connect"":close")
) else (
    echo.
    echo  [X] Failed to inject configuration. Please run terminal as Administrator.
)

echo.
pause
