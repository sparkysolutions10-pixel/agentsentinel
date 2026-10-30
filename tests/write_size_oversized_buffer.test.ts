import { describe, it, expect } from 'vitest';
import {
  writeSizeLimiterRule,
  getContentByteLength,
  createWriteSizeLimiterRule,
  DEFAULT_MAX_WRITE_BYTES,
} from '../src/fs/write_size_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Write Size Limiter Rejects Oversized Content Buffers (Issue #77)', () => {
  describe('80MB string and buffer payload blocking', () => {
    it('blocks an 80MB string payload against default 50MB ceiling', () => {
      // 80MB = 83,886,080 bytes
      const eightyMBSize = 80 * 1024 * 1024;
      // We can use a repeated chunk or large string slice
      const chunk = '0123456789abcdef'.repeat(64); // 1024 bytes
      const eightyMBString = chunk.repeat(80 * 1024);

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: '/tmp/dump.bin',
          content: eightyMBString,
        },
      };

      const violation = writeSizeLimiterRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.ruleId).toBe('fs-limit-file-write-size');
      expect(violation?.reason).toContain('80.00 MB');
      expect(violation?.reason).toContain('50.00 MB');
    });

    it('blocks simulated 80MB buffer descriptor object', () => {
      const eightyMBDescriptor = {
        byteLength: 80 * 1024 * 1024,
      };

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'huge_archive.zip',
          data: eightyMBDescriptor,
        },
      };

      const violation = writeSizeLimiterRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('80.00 MB');
    });

    it('blocks append_file with 60MB payload', () => {
      const ctx: ToolCallContext = {
        toolName: 'append_file',
        params: {
          path: 'app.log',
          data: { size: 60 * 1024 * 1024 },
        },
      };
      const violation = writeSizeLimiterRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('60.00 MB');
    });

    it('allows 40MB payload which is below the 50MB ceiling', () => {
      const fortyMBDescriptor = {
        byteLength: 40 * 1024 * 1024,
      };

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'video.mp4',
          data: fortyMBDescriptor,
        },
      };

      expect(writeSizeLimiterRule.evaluate(ctx)).toBeNull();
    });

    it('allows payload exactly at 50MB ceiling boundary', () => {
      const exactFiftyMB = {
        byteLength: DEFAULT_MAX_WRITE_BYTES,
      };

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'exact.bin',
          content: exactFiftyMB,
        },
      };

      expect(writeSizeLimiterRule.evaluate(ctx)).toBeNull();
    });

    it('blocks payload 1 byte over the 50MB boundary', () => {
      const oneByteOver = {
        byteLength: DEFAULT_MAX_WRITE_BYTES + 1,
      };

      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: {
          path: 'over.bin',
          content: oneByteOver,
        },
      };

      const violation = writeSizeLimiterRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });
  });
});
