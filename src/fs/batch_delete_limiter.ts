/**
 * Batch File Delete Threshold and Rate Limiter.
 * Intercepts bulk or runaway file deletion operations exceeding a configurable
 * threshold (default: 20 files per minute) or mass multi-file delete arrays.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const DEFAULT_MAX_DELETES_PER_MINUTE = 20;
export const DEFAULT_DELETE_WINDOW_MS = 60 * 1000; // 1 minute

const DELETE_TOOL_PATTERN = /(?:delete_file|remove_file|unlink|rm_file|batch_delete|delete_files|remove_files)/i;

export interface BatchDeleteLimiterOptions {
  maxDeletesPerMinute?: number;
  windowMs?: number;
  deleteToolPattern?: RegExp;
}

export class BatchDeleteTracker {
  private deletionTimestamps: number[] = [];
  public readonly maxDeletes: number;
  public readonly windowMs: number;

  constructor(maxDeletes: number = DEFAULT_MAX_DELETES_PER_MINUTE, windowMs: number = DEFAULT_DELETE_WINDOW_MS) {
    this.maxDeletes = maxDeletes;
    this.windowMs = windowMs;
  }

  /**
   * Cleans timestamps outside the sliding window.
   */
  private prune(now: number = Date.now()): void {
    const cutoff = now - this.windowMs;
    this.deletionTimestamps = this.deletionTimestamps.filter((ts) => ts > cutoff);
  }

  /**
   * Records deletion count and checks if limit is exceeded.
   */
  public record(count: number = 1, now: number = Date.now()): { currentCount: number; isExceeded: boolean } {
    this.prune(now);
    for (let i = 0; i < count; i++) {
      this.deletionTimestamps.push(now);
    }
    const currentCount = this.deletionTimestamps.length;
    return {
      currentCount,
      isExceeded: currentCount > this.maxDeletes,
    };
  }

  /**
   * Checks current count without modifying history.
   */
  public check(additionalCount: number = 0, now: number = Date.now()): { currentCount: number; wouldExceed: boolean } {
    this.prune(now);
    const count = this.deletionTimestamps.length + additionalCount;
    return {
      currentCount: this.deletionTimestamps.length,
      wouldExceed: count > this.maxDeletes,
    };
  }

  /**
   * Resets the tracker history.
   */
  public reset(): void {
    this.deletionTimestamps = [];
  }
}

/**
 * Creates SentinelRule to rate-limit bulk file deletions.
 */
export function createBatchDeleteLimiterRule(
  options?: BatchDeleteLimiterOptions
): SentinelRule & { tracker: BatchDeleteTracker } {
  const maxDeletes = options?.maxDeletesPerMinute ?? DEFAULT_MAX_DELETES_PER_MINUTE;
  const windowMs = options?.windowMs ?? DEFAULT_DELETE_WINDOW_MS;
  const toolPattern = options?.deleteToolPattern || DELETE_TOOL_PATTERN;
  const tracker = new BatchDeleteTracker(maxDeletes, windowMs);

  const rule: SentinelRule & { tracker: BatchDeleteTracker } = {
    id: 'fs-limit-batch-file-deletes',
    name: 'Rate-Limit Bulk and Batch File Deletions',
    category: 'fs',
    priority: 950,
    enabled: true,
    tracker,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let isDelete = toolPattern.test(ctx.toolName);

      // Check action parameter if toolName is generic
      if (!isDelete && ctx.params && typeof ctx.params === 'object') {
        const action = (ctx.params as Record<string, unknown>).action;
        if (typeof action === 'string' && /^(?:delete|remove|unlink|rm)$/i.test(action)) {
          isDelete = true;
        }
      }

      if (!isDelete) {
        return null;
      }

      // Count deletions in this single call (could be single path or array of paths)
      let count = 1;
      if (ctx.params && typeof ctx.params === 'object') {
        const p = ctx.params as Record<string, unknown>;
        if (Array.isArray(p.files)) {
          count = p.files.length;
        } else if (Array.isArray(p.paths)) {
          count = p.paths.length;
        } else if (Array.isArray(p.targets)) {
          count = p.targets.length;
        }
      }

      const status = tracker.check(count);
      if (status.wouldExceed) {
        return {
          ruleId: 'fs-limit-batch-file-deletes',
          ruleName: 'Rate-Limit Bulk and Batch File Deletions',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Batch file deletion threshold exceeded: request would cause ${status.currentCount + count} deletions in ${windowMs / 1000}s (maximum allowed: ${maxDeletes})`,
        };
      }

      // Record deletions
      tracker.record(count);
      return null;
    },
  };

  return rule;
}

export const batchDeleteLimiterRule = createBatchDeleteLimiterRule();
