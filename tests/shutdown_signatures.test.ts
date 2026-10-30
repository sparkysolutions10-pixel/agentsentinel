import { describe, it, expect } from 'vitest';
import {
  detectShutdownCommand,
  shutdownBlockerRule,
} from '../src/shell/shutdown.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Shutdown Detector Cross-Platform Signatures (Linux, Windows, macOS)', () => {
  describe('Windows Shutdown and Restart Signatures', () => {
    it('detects shutdown /s /t 0 with immediate powerdown', () => {
      const cmd = 'shutdown /s /t 0';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('windows');
      expect(res.action).toBe('shutdown');
    });

    it('detects shutdown /r /t 0 /f with forced restart', () => {
      const cmd = 'shutdown /r /t 0 /f';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('windows');
      expect(res.action).toBe('reboot');
    });

    it('detects shutdown /p (immediate power off)', () => {
      const cmd = 'shutdown /p';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('windows');
      expect(res.action).toBe('shutdown');
    });

    it('detects shutdown.exe binary invocation with Windows flags', () => {
      const cmd = 'C:\\Windows\\System32\\shutdown.exe /s /f';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('windows');
    });

    it('detects PowerShell Stop-Computer and Restart-Computer with parameters', () => {
      const stopRes = detectShutdownCommand('Stop-Computer -ComputerName localhost -Force');
      expect(stopRes.isShutdown).toBe(true);
      expect(stopRes.platform).toBe('windows');
      expect(stopRes.action).toBe('shutdown');

      const restartRes = detectShutdownCommand('Restart-Computer -Force -Wait');
      expect(restartRes.isShutdown).toBe(true);
      expect(restartRes.platform).toBe('windows');
      expect(restartRes.action).toBe('reboot');
    });
  });

  describe('Linux and POSIX Signatures', () => {
    it('detects SysVinit init 6 (reboot)', () => {
      const cmd = 'init 6';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('linux');
      expect(res.action).toBe('reboot');
    });

    it('detects SysVinit init 0 (halt)', () => {
      const cmd = 'init 0';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('linux');
      expect(res.action).toBe('halt');
    });

    it('detects systemctl reboot and poweroff variations', () => {
      const rebootRes = detectShutdownCommand('systemctl reboot');
      expect(rebootRes.isShutdown).toBe(true);
      expect(rebootRes.platform).toBe('linux');
      expect(rebootRes.action).toBe('reboot');

      const poweroffRes = detectShutdownCommand('sudo systemctl poweroff -i');
      expect(poweroffRes.isShutdown).toBe(true);
      expect(poweroffRes.platform).toBe('linux');
      expect(poweroffRes.action).toBe('shutdown');
    });

    it('detects /sbin/shutdown with time argument and message', () => {
      const cmd = '/sbin/shutdown -r +5 "Kernel security update reboot"';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('linux');
      expect(res.action).toBe('reboot');
    });

    it('detects halt and poweroff commands', () => {
      const haltRes = detectShutdownCommand('halt');
      expect(haltRes.isShutdown).toBe(true);
      expect(haltRes.action).toBe('halt');

      const poweroffRes = detectShutdownCommand('poweroff -f');
      expect(poweroffRes.isShutdown).toBe(true);
      expect(poweroffRes.action).toBe('poweroff');
    });
  });

  describe('macOS AppleScript Signatures', () => {
    it('detects AppleScript tell app System Events to shut down', () => {
      const cmd = 'osascript -e \'tell application "System Events" to shut down\'';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('macos');
      expect(res.action).toBe('shutdown');
    });

    it('detects AppleScript tell app System Events to restart', () => {
      const cmd = 'osascript -e \'tell application "System Events" to restart\'';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('macos');
      expect(res.action).toBe('reboot');
    });
  });

  describe('Chained Execution Signatures', () => {
    it('detects chained command ending in shutdown /s /t 0', () => {
      const cmd = 'npm run build && shutdown /s /t 0';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('windows');
    });

    it('detects chained command with init 6', () => {
      const cmd = 'sync; sync; init 6';
      const res = detectShutdownCommand(cmd);
      expect(res.isShutdown).toBe(true);
      expect(res.platform).toBe('linux');
    });
  });

  describe('SentinelEngine Integration', () => {
    it('engine blocks all shutdown and reboot signatures', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(shutdownBlockerRule);

      const targets = [
        'shutdown /s /t 0',
        'init 6',
        'systemctl reboot',
        'Stop-Computer -Force',
        'osascript -e "tell app \\"System Events\\" to shut down"',
      ];

      for (const cmd of targets) {
        const result = await engine.evaluate({
          id: 'eval-shutdown-sig',
          toolName: 'bash',
          params: { command: cmd },
          timestamp: Date.now(),
        });

        expect(result.allowed).toBe(false);
        expect(result.verdict).toBe(Verdict.BLOCK);
        expect(result.violations[0].ruleId).toBe('block-system-shutdown-reboot');
        expect(result.violations[0].severity).toBe('critical');
      }
    });

    it('engine permits safe system administration commands', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(shutdownBlockerRule);

      const safeCommands = [
        'uptime',
        'systemctl status docker',
        'Get-Process -Name explorer',
        'cat /proc/uptime',
      ];

      for (const cmd of safeCommands) {
        const result = await engine.evaluate({
          id: 'eval-safe-admin',
          toolName: 'bash',
          params: { command: cmd },
          timestamp: Date.now(),
        });

        expect(result.allowed).toBe(true);
        expect(result.verdict).toBe(Verdict.ALLOW);
        expect(result.violations.length).toBe(0);
      }
    });
  });
});
