import { describe, it, expect } from 'vitest';
import {
  isSensitiveSystemPath,
  sensitiveDirectoryBlockerRule,
} from '../src/fs/sensitive_directory_blocker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('System File Read Blocker: SSH & /etc/shadow (Issue #73)', () => {
  describe('Specific credential file detection', () => {
    it('detects ~/.ssh/id_rsa and other private key variants', () => {
      expect(isSensitiveSystemPath('~/.ssh/id_rsa')).toBe(true);
      expect(isSensitiveSystemPath('~/.ssh/id_ecdsa')).toBe(true);
      expect(isSensitiveSystemPath('~/.ssh/id_ed25519')).toBe(true);
      expect(isSensitiveSystemPath('~/.ssh/id_dsa')).toBe(true);
    });

    it('detects known_hosts and authorized_keys', () => {
      expect(isSensitiveSystemPath('~/.ssh/known_hosts')).toBe(true);
      expect(isSensitiveSystemPath('~/.ssh/authorized_keys')).toBe(true);
      expect(isSensitiveSystemPath('/root/.ssh/known_hosts')).toBe(true);
      expect(isSensitiveSystemPath('.ssh/known_hosts')).toBe(true);
    });

    it('detects /etc/shadow and /etc/shadow backup copies', () => {
      expect(isSensitiveSystemPath('/etc/shadow')).toBe(true);
      expect(isSensitiveSystemPath('/etc/shadow-')).toBe(true);
      expect(isSensitiveSystemPath('/etc/shadow.bak')).toBe(true);
      expect(isSensitiveSystemPath('/private/etc/shadow')).toBe(true);
    });

    it('detects Windows user SSH key paths', () => {
      expect(isSensitiveSystemPath('C:\\Users\\Developer\\.ssh\\id_rsa')).toBe(true);
      expect(isSensitiveSystemPath('C:\\Users\\admin\\.ssh\\known_hosts')).toBe(true);
    });

    it('avoids false positives on harmless files with similar words', () => {
      expect(isSensitiveSystemPath('docs/ssh_setup_guide.md')).toBe(false);
      expect(isSensitiveSystemPath('assets/css/box_shadow.css')).toBe(false);
      expect(isSensitiveSystemPath('src/ui/shadow_container.tsx')).toBe(false);
      expect(isSensitiveSystemPath('notes/etc_meetings.txt')).toBe(false);
    });
  });

  describe('Sentinel Rule enforcement on sensitive file reads', () => {
    it('rejects attempts to read ~/.ssh/id_rsa with Verdict.BLOCK', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '~/.ssh/id_rsa' },
      };
      const violation = sensitiveDirectoryBlockerRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-block-sensitive-system-dirs');
      expect(violation?.reason).toContain('User SSH Key & Credentials');
    });

    it('rejects attempts to read known_hosts across various file parameters', () => {
      const ctxPath: ToolCallContext = {
        toolName: 'cat_file',
        params: { filePath: '/home/ubuntu/.ssh/known_hosts' },
      };
      expect(sensitiveDirectoryBlockerRule.evaluate(ctxPath)?.verdict).toBe(Verdict.BLOCK);

      const ctxFilename: ToolCallContext = {
        toolName: 'fs_read',
        params: { filename: '.ssh/known_hosts' },
      };
      expect(sensitiveDirectoryBlockerRule.evaluate(ctxFilename)?.verdict).toBe(Verdict.BLOCK);
    });

    it('rejects attempts to read /etc/shadow with Verdict.BLOCK', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/etc/shadow' },
      };
      const violation = sensitiveDirectoryBlockerRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('/etc System Configuration');
    });

    it('permits read operations on normal codebase files', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'README.md' },
      };
      expect(sensitiveDirectoryBlockerRule.evaluate(ctx)).toBeNull();

      const docCtx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'docs/ssh_setup_guide.md' },
      };
      expect(sensitiveDirectoryBlockerRule.evaluate(docCtx)).toBeNull();
    });
  });
});
