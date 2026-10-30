import { describe, it, expect } from 'vitest';
import {
  isInsideWorkspaceJail,
  inspectWorkspaceJail,
  normalizeJailPath,
  createWorkspaceJailGuardRule,
} from '../src/fs/workspace_jail.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Allowed Workspace Directory Jail Validator (Issue #78)', () => {
  const allowedRoots = ['/workspace/project', '/tmp/scratch'];
  const baseDir = '/workspace/project';

  describe('normalizeJailPath', () => {
    it('normalizes backslashes to forward slashes', () => {
      expect(normalizeJailPath('C:\\workspace\\project\\src')).toBe('c:/workspace/project/src');
    });

    it('removes trailing slashes', () => {
      expect(normalizeJailPath('/workspace/project/')).toBe('/workspace/project');
      expect(normalizeJailPath('C:\\app\\')).toBe('c:/app');
    });
  });

  describe('isInsideWorkspaceJail check', () => {
    it('allows files located directly inside allowed root', () => {
      expect(isInsideWorkspaceJail('/workspace/project/src/index.ts', allowedRoots)).toBe(true);
      expect(isInsideWorkspaceJail('/tmp/scratch/temp_file.txt', allowedRoots)).toBe(true);
    });

    it('allows relative paths resolving within baseDir', () => {
      expect(isInsideWorkspaceJail('src/index.ts', allowedRoots, baseDir)).toBe(true);
      expect(isInsideWorkspaceJail('./data/input.json', allowedRoots, baseDir)).toBe(true);
    });

    it('rejects files outside allowed roots', () => {
      expect(isInsideWorkspaceJail('/etc/passwd', allowedRoots, baseDir)).toBe(false);
      expect(isInsideWorkspaceJail('/var/log/syslog', allowedRoots, baseDir)).toBe(false);
      expect(isInsideWorkspaceJail('/workspace/other_project/secret.key', allowedRoots, baseDir)).toBe(false);
    });

    it('prevents prefix collision bypasses (/workspace/project_extra)', () => {
      // /workspace/project should not inadvertently match /workspace/project_extra
      expect(isInsideWorkspaceJail('/workspace/project_extra/file.txt', allowedRoots, baseDir)).toBe(false);
    });
  });

  describe('createWorkspaceJailGuardRule enforcement', () => {
    const jailRule = createWorkspaceJailGuardRule({
      allowedRoots: ['/workspace/app', '/var/tmp/app_cache'],
      defaultBaseDir: '/workspace/app',
    });

    it('allows tool call with path inside workspace jail', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/workspace/app/package.json' },
      };
      expect(jailRule.evaluate(ctx)).toBeNull();
    });

    it('allows tool call with relative path inside workspace jail', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: { path: 'src/components/App.tsx' },
      };
      expect(jailRule.evaluate(ctx)).toBeNull();
    });

    it('blocks tool call targeting file outside workspace jail with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/etc/shadow' },
      };
      const violation = jailRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-workspace-jail-validator');
      expect(violation?.reason).toContain('escapes outside allowed workspace boundaries');
    });

    it('blocks copy_file when dest parameter escapes workspace jail', () => {
      const ctx: ToolCallContext = {
        toolName: 'copy_file',
        params: {
          src: '/workspace/app/data.txt',
          dest: '/opt/exfiltrated.txt',
        },
      };
      const violation = jailRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('/opt/exfiltrated.txt');
    });

    it('supports multiple roots seamlessly', () => {
      const cacheCtx: ToolCallContext = {
        toolName: 'write_file',
        params: { path: '/var/tmp/app_cache/session.dat' },
      };
      expect(jailRule.evaluate(cacheCtx)).toBeNull();
    });
  });
});
