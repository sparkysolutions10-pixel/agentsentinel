@echo off
chcp 65001 >nul
title AgentSentinel 1-Click AI Workspace Connector
color 0B

echo ==============================================================================
echo   [+] AGENTSENTINEL ZERO-TRUST AST DEFENSE -- 1-CLICK MULTI-AGENT CONNECTOR
echo ==============================================================================
echo.
echo  [*] Connecting AgentSentinel to Claude Desktop and Cursor IDE...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0connect.ps1"

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo   [OK] SUCCESS! AgentSentinel Cloud is now CONNECTED!
    echo ==============================================================================
    echo   * Endpoint: https://mcp.getagentsentinel.com/sse
    echo   * Defense:  AST Firewall, 90%% Token-Saver SmartProxy, Merkle Flight Recorder
    echo.
    echo   Next Step: Please RESTART Claude Desktop / Reload Cursor to activate.
    echo ==============================================================================
    
    :: Show native Windows confirmation box
    mshta vbscript:Execute("msgbox ""[SUCCESS] AgentSentinel Cloud Defense is now connected to Claude Desktop and Cursor IDE!"" & vbCrLf & vbCrLf & ""Please restart Claude Desktop or reload Cursor to activate your tools."", 64, ""AgentSentinel 1-Click Connect"":close")
) else (
    echo.
    echo  [X] Failed to inject configuration. Please run terminal as Administrator.
)

echo.
pause
