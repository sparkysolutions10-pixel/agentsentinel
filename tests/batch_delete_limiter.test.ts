import { describe, it, expect, beforeEach } from 'vitest';
import {
  BatchDeleteTracker,
  createBatchDeleteLimiterRule,
} from '../src/fs/batch_delete_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Batch File Delete Threshold Limiter (Issue #80)', () => {
  describe('BatchDeleteTracker sliding window', () => {
    let tracker: BatchDeleteTracker;

    beforeEach(() => {
      tracker = new BatchDeleteTracker(5, 1000); // 5 deletes per 1000ms
    });

    it('records deletions and detects limit breach', () => {
      expect(tracker.record(3).isExceeded).toBe(false);
      expect(tracker.record(2).isExceeded).toBe(false);
      expect(tracker.record(1).isExceeded).toBe(true);
    });

    it('prunes entries older than windowMs', () => {
      const now = 10000;
      tracker.record(5, now);
      expect(tracker.check(1, now).wouldExceed).toBe(true);

      // 1500ms later (outside 1000ms window)
      expect(tracker.check(1, now + 1500).wouldExceed).toBe(false);
    });

    it('resets state on demand', () => {
      tracker.record(5);
      tracker.reset();
      expect(tracker.check(1).wouldExceed).toBe(false);
    });
  });

  describe('createBatchDeleteLimiterRule enforcement', () => {
    it('allows sequential deletions within the threshold', () => {
      const rule = createBatchDeleteLimiterRule({ maxDeletesPerMinute: 3 });

      const ctx1: ToolCallContext = { toolName: 'delete_file', params: { path: 'file1.txt' } };
      const ctx2: ToolCallContext = { toolName: 'delete_file', params: { path: 'file2.txt' } };
      const ctx3: ToolCallContext = { toolName: 'delete_file', params: { path: 'file3.txt' } };

      expect(rule.evaluate(ctx1)).toBeNull();
      expect(rule.evaluate(ctx2)).toBeNull();
      expect(rule.evaluate(ctx3)).toBeNull();
    });

    it('blocks subsequent deletion when threshold is exceeded', () => {
      const rule = createBatchDeleteLimiterRule({ maxDeletesPerMinute: 2 });

      rule.evaluate({ toolName: 'delete_file', params: { path: 'file1.txt' } });
      rule.evaluate({ toolName: 'delete_file', params: { path: 'file2.txt' } });

      const violation = rule.evaluate({ toolName: 'delete_file', params: { path: 'file3.txt' } });
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-limit-batch-file-deletes');
      expect(violation?.reason).toContain('Batch file deletion threshold exceeded');
    });

    it('blocks bulk multi-file deletion array in a single tool call', () => {
      const rule = createBatchDeleteLimiterRule({ maxDeletesPerMinute: 5 });

      const ctx: ToolCallContext = {
        toolName: 'batch_delete',
        params: {
          files: ['f1.txt', 'f2.txt', 'f3.txt', 'f4.txt', 'f5.txt', 'f6.txt'],
        },
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('would cause 6 deletions');
    });

    it('detects generic tool with delete action parameter', () => {
      const rule = createBatchDeleteLimiterRule({ maxDeletesPerMinute: 1 });

      rule.evaluate({ toolName: 'fs_manager', params: { action: 'delete', path: 'f1.tmp' } });

      const violation = rule.evaluate({ toolName: 'fs_manager', params: { action: 'delete', path: 'f2.tmp' } });
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('ignores non-delete tool calls', () => {
      const rule = createBatchDeleteLimiterRule({ maxDeletesPerMinute: 1 });
      const readCtx: ToolCallContext = { toolName: 'read_file', params: { path: 'doc.txt' } };
      expect(rule.evaluate(readCtx)).toBeNull();
      expect(rule.evaluate(readCtx)).toBeNull();
    });
  });
});
