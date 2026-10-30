import { describe, it, expect } from 'vitest';
import {
  isSensitiveSystemPath,
  inspectSensitivePath,
  createSensitiveDirectoryBlockerRule,
  sensitiveDirectoryBlockerRule,
} from '../src/fs/sensitive_directory_blocker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Sensitive System Directory Read Blocker (Issue #72)', () => {
  describe('isSensitiveSystemPath detection', () => {
    it('detects /etc system configuration paths', () => {
      expect(isSensitiveSystemPath('/etc/passwd')).toBe(true);
      expect(isSensitiveSystemPath('/etc/shadow')).toBe(true);
      expect(isSensitiveSystemPath('/etc/sudoers')).toBe(true);
      expect(isSensitiveSystemPath('/etc/nginx/nginx.conf')).toBe(true);
    });

    it('detects /proc and /sys virtual filesystem paths', () => {
      expect(isSensitiveSystemPath('/proc/self/environ')).toBe(true);
      expect(isSensitiveSystemPath('/proc/cpuinfo')).toBe(true);
      expect(isSensitiveSystemPath('/proc/kcore')).toBe(true);
      expect(isSensitiveSystemPath('/sys/class/net')).toBe(true);
    });

    it('detects /var/run and /root administrative paths', () => {
      expect(isSensitiveSystemPath('/var/run/docker.sock')).toBe(true);
      expect(isSensitiveSystemPath('/var/run/secrets.pid')).toBe(true);
      expect(isSensitiveSystemPath('/root/.bashrc')).toBe(true);
      expect(isSensitiveSystemPath('/root/.ssh/id_rsa')).toBe(true);
    });

    it('detects user SSH key and credential stores', () => {
      expect(isSensitiveSystemPath('~/.ssh/id_rsa')).toBe(true);
      expect(isSensitiveSystemPath('/home/user/.ssh/authorized_keys')).toBe(true);
      expect(isSensitiveSystemPath('.ssh/id_ed25519')).toBe(true);
      expect(isSensitiveSystemPath('C:\\Users\\admin\\.ssh\\id_rsa')).toBe(true);
    });

    it('detects Windows System32 and registry SAM files', () => {
      expect(isSensitiveSystemPath('C:\\Windows\\System32\\cmd.exe')).toBe(true);
      expect(isSensitiveSystemPath('C:\\Windows\\System32\\config\\SAM')).toBe(true);
      expect(isSensitiveSystemPath('\\Windows\\System32\\drivers\\etc\\hosts')).toBe(true);
    });

    it('allows regular workspace and application files', () => {
      expect(isSensitiveSystemPath('src/index.ts')).toBe(false);
      expect(isSensitiveSystemPath('package.json')).toBe(false);
      expect(isSensitiveSystemPath('/home/user/workspace/app/config.json')).toBe(false);
      expect(isSensitiveSystemPath('D:\\PersonalAI\\agentsentinel\\tests\\engine.test.ts')).toBe(false);
    });
  });

  describe('inspectSensitivePath category mapping', () => {
    it('categorizes credentials accurately', () => {
      const ssh = inspectSensitivePath('~/.ssh/id_rsa');
      expect(ssh.isSensitive).toBe(true);
      expect(ssh.category).toBe('credentials');

      const etc = inspectSensitivePath('/etc/passwd');
      expect(etc.isSensitive).toBe(true);
      expect(etc.category).toBe('system_config');

      const proc = inspectSensitivePath('/proc/self/cmdline');
      expect(proc.isSensitive).toBe(true);
      expect(proc.category).toBe('kernel_proc');

      const win = inspectSensitivePath('C:\\Windows\\System32\\calc.exe');
      expect(win.isSensitive).toBe(true);
      expect(win.category).toBe('windows_system');
    });
  });

  describe('sensitiveDirectoryBlockerRule enforcement', () => {
    it('blocks read_file attempts targeting /etc/shadow with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/etc/shadow' },
      };
      const violation = sensitiveDirectoryBlockerRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-block-sensitive-system-dirs');
      expect(violation?.reason).toContain('restricted system location');
    });

    it('blocks reading user private SSH keys', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { filePath: '~/.ssh/id_rsa' },
      };
      const violation = sensitiveDirectoryBlockerRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('blocks accessing Windows System32 config directory', () => {
      const ctx: ToolCallContext = {
        toolName: 'filesystem_read',
        params: { path: 'C:\\Windows\\System32\\config\\SAM' },
      };
      const violation = sensitiveDirectoryBlockerRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('allows benign reads of workspace files', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'src/types.ts' },
      };
      expect(sensitiveDirectoryBlockerRule.evaluate(ctx)).toBeNull();
    });

    it('supports custom blocked directory regex patterns', () => {
      const customRule = createSensitiveDirectoryBlockerRule({
        customBlockedPatterns: [/^\/opt\/proprietary(?:[/\\]|$)/i],
      });

      const blockedCtx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/opt/proprietary/keys.pem' },
      };
      expect(customRule.evaluate(blockedCtx)?.verdict).toBe(Verdict.BLOCK);

      const allowedCtx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/opt/open_source/readme.txt' },
      };
      expect(customRule.evaluate(allowedCtx)).toBeNull();
    });
  });
});
