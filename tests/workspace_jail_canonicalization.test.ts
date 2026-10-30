import { describe, it, expect } from 'vitest';
import {
  isInsideWorkspaceJail,
  inspectWorkspaceJail,
  normalizeJailPath,
  createWorkspaceJailGuardRule,
} from '../src/fs/workspace_jail.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Workspace Jail Validator: Windows & POSIX Formats (Issue #79)', () => {
  const allowedRoots = [
    'C:\\workspace\\project',
    '/var/app/project',
    '/mnt/storage/shared',
  ];

  describe('Windows path canonicalization', () => {
    it('handles uppercase and lowercase drive letters', () => {
      expect(isInsideWorkspaceJail('C:\\workspace\\project\\src\\index.ts', allowedRoots)).toBe(true);
      expect(isInsideWorkspaceJail('c:\\workspace\\project\\src\\index.ts', allowedRoots)).toBe(true);
      expect(isInsideWorkspaceJail('c:/workspace/project/src/index.ts', allowedRoots)).toBe(true);
    });

    it('handles mixed slash separators in Windows paths', () => {
      expect(isInsideWorkspaceJail('C:/workspace\\project/config\\settings.json', allowedRoots)).toBe(true);
      expect(isInsideWorkspaceJail('c:\\workspace/project\\data/raw.csv', allowedRoots)).toBe(true);
    });

    it('rejects paths on a different drive letter', () => {
      expect(isInsideWorkspaceJail('D:\\workspace\\project\\src\\index.ts', allowedRoots)).toBe(false);
      expect(isInsideWorkspaceJail('E:\\backup\\secret.key', allowedRoots)).toBe(false);
    });

    it('rejects Windows jailbreak attempts via relative escapes', () => {
      expect(isInsideWorkspaceJail('C:\\workspace\\project\\..\\..\\windows\\system32', allowedRoots)).toBe(false);
      expect(isInsideWorkspaceJail('c:/workspace/project/../../boot.ini', allowedRoots)).toBe(false);
    });
  });

  describe('POSIX path canonicalization', () => {
    it('normalizes redundant consecutive slashes', () => {
      expect(isInsideWorkspaceJail('//var///app////project//main.py', allowedRoots)).toBe(true);
    });

    it('normalizes dot segments within allowed root', () => {
      expect(isInsideWorkspaceJail('/var/app/project/./src/./utils/helper.ts', allowedRoots)).toBe(true);
    });

    it('rejects POSIX jailbreak attempts escaping root', () => {
      expect(isInsideWorkspaceJail('/var/app/project/../../etc/passwd', allowedRoots)).toBe(false);
      expect(isInsideWorkspaceJail('/var/app/project/../project_secrets', allowedRoots)).toBe(false);
    });

    it('handles multiple POSIX roots simultaneously', () => {
      expect(isInsideWorkspaceJail('/mnt/storage/shared/data.parquet', allowedRoots)).toBe(true);
      expect(isInsideWorkspaceJail('/mnt/storage/private/admin.key', allowedRoots)).toBe(false);
    });
  });

  describe('Sentinel Rule interception across diverse path formats', () => {
    const jailRule = createWorkspaceJailGuardRule({
      allowedRoots: ['C:\\MyApp', '/home/agent/workspace'],
      defaultBaseDir: '/home/agent/workspace',
    });

    it('allows valid Windows tool call parameter', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'c:/myapp/src/index.ts' },
      };
      expect(jailRule.evaluate(ctx)).toBeNull();
    });

    it('blocks Windows path jailbreak attempt with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: { path: 'C:\\MyApp\\..\\Windows\\System32\\calc.exe' },
      };
      const violation = jailRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('allows valid POSIX tool call parameter', () => {
      const ctx: ToolCallContext = {
        toolName: 'edit_file',
        params: { filePath: '/home/agent/workspace/README.md' },
      };
      expect(jailRule.evaluate(ctx)).toBeNull();
    });

    it('blocks POSIX path jailbreak attempt targeting /etc/hosts', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '/home/agent/workspace/../../etc/hosts' },
      };
      const violation = jailRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('escapes outside allowed workspace boundaries');
    });
  });
});
