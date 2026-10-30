import { describe, it, expect } from 'vitest';
import {
  isPathTraversal,
  detectPathTraversal,
  normalizePathEncodings,
  pathTraversalGuardRule,
} from '../src/fs/path_traversal.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Path Traversal with URL-Encoded and Unicode Dot Segments (Issue #71)', () => {
  describe('normalizePathEncodings', () => {
    it('decodes standard URL-encoded dot segments (%2e%2e%2f)', () => {
      expect(normalizePathEncodings('%2e%2e%2fetc%2fpasswd')).toBe('../etc/passwd');
      expect(normalizePathEncodings('%2e%2e%2f%2e%2e%2fetc%2fpasswd')).toBe('../../etc/passwd');
      expect(normalizePathEncodings('%2e%2e%5cboot.ini')).toBe('..\\boot.ini');
    });

    it('decodes double-encoded sequences (%252e%252e%252f)', () => {
      expect(normalizePathEncodings('%252e%252e%252fetc%2fshadow')).toBe('../etc/shadow');
      expect(normalizePathEncodings('%252e%252e%252f%252e%252e%252fetc%2fshadow')).toBe('../../etc/shadow');
    });

    it('decodes overlong UTF-8 representations (%c0%ae%c0%ae%c0%af)', () => {
      expect(normalizePathEncodings('%c0%ae%c0%ae%c0%afetc/passwd')).toBe('../etc/passwd');
    });

    it('normalizes Unicode fullwidth dot and slash homoglyphs', () => {
      // \uFF0E is fullwidth dot (．), \uFF0F is fullwidth slash (／)
      expect(normalizePathEncodings('\uFF0E\uFF0E\uFF0Fetc/hosts')).toBe('../etc/hosts');
    });
  });

  describe('isPathTraversal with encoded forms', () => {
    it('detects standard URL encoded traversal', () => {
      expect(isPathTraversal('%2e%2e%2fetc%2fpasswd')).toBe(true);
      expect(isPathTraversal('data/%2e%2e/%2e%2e/etc/passwd')).toBe(true);
      expect(isPathTraversal('..%2fetc%2fshadow')).toBe(true);
      expect(isPathTraversal('%2e%2e/etc/hosts')).toBe(true);
    });

    it('detects double encoded traversal', () => {
      expect(isPathTraversal('%252e%252e%252fwindows/system32')).toBe(true);
      expect(isPathTraversal('backup/%252e%252e/config.json')).toBe(true);
    });

    it('detects overlong UTF-8 byte traversal', () => {
      expect(isPathTraversal('%c0%ae%c0%ae%c0%afvar/log/auth.log')).toBe(true);
    });

    it('detects Unicode fullwidth traversal homoglyphs', () => {
      expect(isPathTraversal('\uFF0E\uFF0E/\uFF0E\uFF0E/etc/passwd')).toBe(true);
      expect(isPathTraversal('\uFF0E\uFF0E\uFF3Cwindows\uFF3Csystem.ini')).toBe(true);
    });

    it('allows benign percent characters and regular Unicode characters', () => {
      expect(isPathTraversal('sales_q1_100%_bonus.xlsx')).toBe(false);
      expect(isPathTraversal('docs/Über_uns/Finanzen.pdf')).toBe(false);
      expect(isPathTraversal('photos/東京_2026/image.jpg')).toBe(false);
    });
  });

  describe('detectPathTraversal analysis', () => {
    it('reports obfuscated encoding in reason and normalizedPath', () => {
      const res = detectPathTraversal('%2e%2e%2f%2e%2e%2fetc%2fpasswd');
      expect(res.hasTraversal).toBe(true);
      expect(res.depth).toBe(2);
      expect(res.normalizedPath).toBe('../../etc/passwd');
      expect(res.reason).toContain('obfuscated encoding resolved');
    });
  });

  describe('Sentinel Rule interception of obfuscated traversal', () => {
    it('blocks tool calls with URL-encoded traversal payloads', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '%2e%2e%2f%2e%2e%2fetc%2fshadow' },
      };
      const violation = pathTraversalGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('obfuscated encoding resolved');
    });

    it('blocks tool calls with Unicode fullwidth traversal payloads', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '\uFF0E\uFF0E/\uFF0E\uFF0E/windows/system32/cmd.exe' },
      };
      const violation = pathTraversalGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('allows clean legitimate filenames without false positive', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'reports/discount_20%_march.pdf' },
      };
      expect(pathTraversalGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
