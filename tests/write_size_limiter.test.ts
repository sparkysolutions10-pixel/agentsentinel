import { describe, it, expect } from 'vitest';
import {
  getContentByteLength,
  createWriteSizeLimiterRule,
  writeSizeLimiterRule,
  DEFAULT_MAX_WRITE_BYTES,
} from '../src/fs/write_size_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Maximum File Write Size Ceiling Limiter (Issue #76)', () => {
  describe('getContentByteLength calculation', () => {
    it('computes ASCII string length in bytes', () => {
      expect(getContentByteLength('hello world')).toBe(11);
    });

    it('computes multibyte Unicode string length accurately', () => {
      // '🌟' is 4 bytes in UTF-8
      expect(getContentByteLength('🌟')).toBe(4);
      expect(getContentByteLength('Antigravity 🚀')).toBe(16);
    });

    it('handles Uint8Array and Buffer payloads', () => {
      const u8 = new Uint8Array(2048);
      expect(getContentByteLength(u8)).toBe(2048);
    });

    it('returns 0 for null or undefined payloads', () => {
      expect(getContentByteLength(null)).toBe(0);
      expect(getContentByteLength(undefined)).toBe(0);
    });
  });

  describe('writeSizeLimiterRule enforcement', () => {
    it('allows write payloads under the default 50MB ceiling limit', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'src/data.json',
          content: '{"key": "value"}',
        },
      };
      expect(writeSizeLimiterRule.evaluate(ctx)).toBeNull();
    });

    it('blocks write payloads exceeding custom ceiling limit', () => {
      // Set limit to 100 bytes
      const strictRule = createWriteSizeLimiterRule({ maxSizeBytes: 100 });
      const bigString = 'A'.repeat(150);

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'out.txt',
          content: bigString,
        },
      };

      const violation = strictRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.ruleId).toBe('fs-limit-file-write-size');
      expect(violation?.reason).toContain('exceeds ceiling limit');
    });

    it('checks varied content fields (data, buffer, replacement)', () => {
      const strictRule = createWriteSizeLimiterRule({ maxSizeBytes: 50 });

      const dataCtx: ToolCallContext = {
        toolName: 'save_file',
        params: { path: 'file.bin', data: new Uint8Array(100) },
      };
      expect(strictRule.evaluate(dataCtx)?.verdict).toBe(Verdict.BLOCK);

      const editCtx: ToolCallContext = {
        toolName: 'edit_file',
        params: { path: 'file.txt', replacement: 'X'.repeat(60) },
      };
      expect(strictRule.evaluate(editCtx)?.verdict).toBe(Verdict.BLOCK);
    });

    it('ignores read tools by default', () => {
      const strictRule = createWriteSizeLimiterRule({ maxSizeBytes: 10 });
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: 'test.txt', content: 'X'.repeat(50) },
      };
      expect(strictRule.evaluate(ctx)).toBeNull();
    });

    it('enforces ceiling on all tools when enforceOnAllTools is true', () => {
      const strictRule = createWriteSizeLimiterRule({
        maxSizeBytes: 10,
        enforceOnAllTools: true,
      });
      const ctx: ToolCallContext = {
        toolName: 'custom_consumer',
        params: { payload: 'X'.repeat(50) },
      };
      expect(strictRule.evaluate(ctx)?.verdict).toBe(Verdict.BLOCK);
    });

    it('has default ceiling of 50MB (52428800 bytes)', () => {
      expect(DEFAULT_MAX_WRITE_BYTES).toBe(52428800);
    });
  });
});
