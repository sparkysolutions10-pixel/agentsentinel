import { describe, it, expect } from 'vitest';
import {
  isPathTraversal,
  detectPathTraversal,
  createPathTraversalGuardRule,
  pathTraversalGuardRule,
} from '../src/fs/path_traversal.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('File Path Traversal Guard (Issue #70)', () => {
  describe('isPathTraversal detection', () => {
    it('detects POSIX relative traversal escapes', () => {
      expect(isPathTraversal('../../etc/passwd')).toBe(true);
      expect(isPathTraversal('../etc/shadow')).toBe(true);
      expect(isPathTraversal('data/sub/../../../etc/hosts')).toBe(true);
      expect(isPathTraversal('..')).toBe(true);
    });

    it('detects Windows relative traversal escapes', () => {
      expect(isPathTraversal('..\\..\\windows\\system32')).toBe(true);
      expect(isPathTraversal('..\\boot.ini')).toBe(true);
      expect(isPathTraversal('app\\..\\..\\windows\\win.ini')).toBe(true);
    });

    it('detects mixed slash traversal attempts', () => {
      expect(isPathTraversal('..\\../etc/passwd')).toBe(true);
      expect(isPathTraversal('../../..\\windows/system.ini')).toBe(true);
    });

    it('allows benign relative paths without traversal', () => {
      expect(isPathTraversal('src/index.ts')).toBe(false);
      expect(isPathTraversal('data/reports/2026/q1.csv')).toBe(false);
      expect(isPathTraversal('./local/file.txt')).toBe(false);
    });

    it('allows clean absolute paths', () => {
      expect(isPathTraversal('/var/log/nginx/access.log')).toBe(false);
      expect(isPathTraversal('C:\\Projects\\app\\package.json')).toBe(false);
    });
  });

  describe('detectPathTraversal depth analysis', () => {
    it('computes traversal depth accurately', () => {
      const single = detectPathTraversal('../file.txt');
      expect(single.hasTraversal).toBe(true);
      expect(single.depth).toBe(1);

      const triple = detectPathTraversal('../../../etc/passwd');
      expect(triple.hasTraversal).toBe(true);
      expect(triple.depth).toBe(3);
    });
  });

  describe('pathTraversalGuardRule enforcement', () => {
    it('blocks file read attempt escaping root via ../../etc/passwd', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '../../etc/passwd' },
      };
      const violation = pathTraversalGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-block-path-traversal');
      expect(violation?.reason).toContain('Path traversal attempt intercepted');
    });

    it('blocks file write attempt targeting Windows system directory', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: { filePath: '..\\..\\windows\\system32\\drivers\\etc\\hosts' },
      };
      const violation = pathTraversalGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('blocks copy/move operations with traversal in dest parameter', () => {
      const ctx: ToolCallContext = {
        toolName: 'copy_file',
        params: { src: 'data/test.txt', dest: '../secret_backup.txt' },
      };
      const violation = pathTraversalGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('allows safe workspace file operations without dot-dot sequences', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'src/utils/formatter.ts' },
      };
      expect(pathTraversalGuardRule.evaluate(ctx)).toBeNull();
    });

    it('returns null when no path parameters are present', () => {
      const ctx: ToolCallContext = {
        toolName: 'generic_tool',
        params: { query: 'test' },
      };
      expect(pathTraversalGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
