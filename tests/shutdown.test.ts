import { describe, it, expect } from 'vitest';
import {
  detectShutdownCommand,
  shutdownBlockerRule,
} from '../src/shell/shutdown.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('System Shutdown and Reboot Blocker', () => {
  it('detects shutdown -h now', () => {
    const res = detectShutdownCommand('shutdown -h now');
    expect(res.isShutdown).toBe(true);
    expect(res.action).toBe('shutdown');
    expect(res.platform).toBe('linux');
    expect(res.reason).toContain('POSIX system');
  });

  it('detects shutdown -r now as reboot', () => {
    const res = detectShutdownCommand('shutdown -r now');
    expect(res.isShutdown).toBe(true);
    expect(res.action).toBe('reboot');
  });

  it('detects direct reboot command', () => {
    const res = detectShutdownCommand('reboot');
    expect(res.isShutdown).toBe(true);
    expect(res.action).toBe('reboot');
    expect(res.platform).toBe('linux');
  });

  it('detects /sbin/poweroff and halt', () => {
    const resPower = detectShutdownCommand('/sbin/poweroff');
    expect(resPower.isShutdown).toBe(true);
    expect(resPower.action).toBe('poweroff');

    const resHalt = detectShutdownCommand('halt -p');
    expect(resHalt.isShutdown).toBe(true);
    expect(resHalt.action).toBe('halt');
  });

  it('detects init 0 and init 6 runlevel commands', () => {
    const res0 = detectShutdownCommand('init 0');
    expect(res0.isShutdown).toBe(true);
    expect(res0.action).toBe('halt');

    const res6 = detectShutdownCommand('telinit 6');
    expect(res6.isShutdown).toBe(true);
    expect(res6.action).toBe('reboot');
  });

  it('detects systemctl poweroff and reboot', () => {
    const resSysPower = detectShutdownCommand('systemctl poweroff');
    expect(resSysPower.isShutdown).toBe(true);
    expect(resSysPower.action).toBe('shutdown');

    const resSysReboot = detectShutdownCommand('sudo systemctl reboot -i');
    expect(resSysReboot.isShutdown).toBe(true);
    expect(resSysReboot.action).toBe('reboot');
  });

  it('detects Windows shutdown.exe /s /t 0 and /r', () => {
    const resWin = detectShutdownCommand('shutdown /s /f /t 0');
    expect(resWin.isShutdown).toBe(true);
    expect(resWin.platform).toBe('windows');
    expect(resWin.action).toBe('shutdown');

    const resWinR = detectShutdownCommand('shutdown.exe -r -t 10');
    expect(resWinR.isShutdown).toBe(true);
    expect(resWinR.action).toBe('reboot');
  });

  it('detects PowerShell Stop-Computer and Restart-Computer', () => {
    const resStop = detectShutdownCommand('Stop-Computer -Force');
    expect(resStop.isShutdown).toBe(true);
    expect(resStop.platform).toBe('windows');
    expect(resStop.action).toBe('shutdown');

    const resRestart = detectShutdownCommand('Restart-Computer -Force');
    expect(resRestart.isShutdown).toBe(true);
    expect(resRestart.action).toBe('reboot');
  });

  it('detects macOS AppleScript GUI shutdown', () => {
    const resMac = detectShutdownCommand('osascript -e \'tell app "System Events" to shut down\'');
    expect(resMac.isShutdown).toBe(true);
    expect(resMac.platform).toBe('macos');
    expect(resMac.action).toBe('shutdown');
  });

  it('allows safe informational and non-shutdown commands', () => {
    expect(detectShutdownCommand('shutdown --help').isShutdown).toBe(false);
    expect(detectShutdownCommand('systemctl status nginx').isShutdown).toBe(false);
    expect(detectShutdownCommand('git commit -m "handle system reboot cleanly"').isShutdown).toBe(false);
    expect(detectShutdownCommand('cat /var/log/boot.log').isShutdown).toBe(false);
  });

  it('shutdownBlockerRule blocks shutdown tool calls with critical severity', () => {
    const violation = shutdownBlockerRule.evaluate({
      id: 'call-shut-1',
      toolName: 'bash',
      params: {
        command: 'sudo shutdown -h now',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-system-shutdown-reboot');
  });

  it('SentinelEngine integration blocks shutdown in pipeline', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(shutdownBlockerRule);

    const result = await engine.evaluate({
      id: 'engine-shut-test',
      toolName: 'bash',
      params: {
        command: 'shutdown /s /t 0',
      },
      timestamp: Date.now(),
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations[0].ruleId).toBe('block-system-shutdown-reboot');
  });
});
