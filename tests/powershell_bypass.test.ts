import { describe, it, expect } from 'vitest';
import {
  detectPowerShellBypass,
  powerShellBypassBlockerRule,
} from '../src/shell/powershell_bypass.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Windows PowerShell Security Policy Bypass Flag Detector', () => {
  it('detects powershell.exe -ExecutionPolicy Bypass', () => {
    const cmd = 'powershell.exe -ExecutionPolicy Bypass -File install.ps1';
    const res = detectPowerShellBypass(cmd);
    expect(res.isBypass).toBe(true);
    expect(res.flagsDetected).toContain('-ExecutionPolicy Bypass');
    expect(res.reason).toContain('PowerShell security bypass flags detected');
  });

  it('detects pwsh -ep bypass short flag', () => {
    const cmd = 'pwsh -ep Bypass -Command "Write-Host 123"';
    const res = detectPowerShellBypass(cmd);
    expect(res.isBypass).toBe(true);
    expect(res.flagsDetected).toContain('-ExecutionPolicy Bypass');
  });

  it('detects -WindowStyle Hidden stealth flag', () => {
    const cmd = 'powershell.exe -WindowStyle Hidden -Command "Start-Sleep -Seconds 10"';
    const res = detectPowerShellBypass(cmd);
    expect(res.isBypass).toBe(true);
    expect(res.flagsDetected).toContain('-WindowStyle Hidden');
  });

  it('detects Set-ExecutionPolicy Bypass cmdlet invocation', () => {
    const cmd = 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force';
    const res = detectPowerShellBypass(cmd);
    expect(res.isBypass).toBe(true);
    expect(res.flagsDetected).toContain('Set-ExecutionPolicy Bypass');
  });

  it('detects multi-flag stealth evasion (NoProfile + NonInteractive)', () => {
    const cmd = 'powershell.exe -NoProfile -NonInteractive -Command "Get-Process"';
    const res = detectPowerShellBypass(cmd);
    expect(res.isBypass).toBe(true);
    expect(res.flagsDetected).toContain('-NoProfile');
    expect(res.flagsDetected).toContain('-NonInteractive');
  });

  it('allows safe standard PowerShell invocations without bypass flags', () => {
    expect(detectPowerShellBypass('powershell.exe -Command "Get-Date"').isBypass).toBe(false);
    expect(detectPowerShellBypass('pwsh --version').isBypass).toBe(false);
    expect(detectPowerShellBypass('Get-ExecutionPolicy').isBypass).toBe(false);
    expect(detectPowerShellBypass('npm run build').isBypass).toBe(false);
  });

  it('powerShellBypassBlockerRule blocks bypass tool calls with critical severity', () => {
    const violation = powerShellBypassBlockerRule.evaluate({
      id: 'call-ps-1',
      toolName: 'powershell',
      params: {
        command: 'powershell -ExecutionPolicy Bypass -File malware.ps1',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-powershell-bypass');
  });

  it('SentinelEngine integration blocks PowerShell bypass in pipeline', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(powerShellBypassBlockerRule);

    const result = await engine.evaluate({
      id: 'engine-ps-test',
      toolName: 'powershell',
      params: {
        command: 'pwsh.exe -w Hidden -ep Bypass -c "calc.exe"',
      },
      timestamp: Date.now(),
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations[0].ruleId).toBe('block-powershell-bypass');
  });
});
