/**
 * Maximum File Write Size Ceiling Limiter.
 * Prevents disk exhaustion and buffer stuffing by enforcing a configurable ceiling
 * on individual file write payloads (default: 50MB).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const DEFAULT_MAX_WRITE_BYTES = 50 * 1024 * 1024; // 50 MB

export const DEFAULT_WRITE_CONTENT_FIELDS: string[] = [
  'content',
  'data',
  'text',
  'body',
  'buffer',
  'bytes',
  'payload',
  'replacement',
];

const WRITE_TOOL_PATTERN = /(?:write|create|append|edit|save|patch|store|put)/i;

/**
 * Calculates byte length across strings, buffers, and Uint8Arrays universally.
 */
export function getContentByteLength(content: unknown): number {
  if (content === null || content === undefined) {
    return 0;
  }

  if (typeof content === 'string') {
    // Universal UTF-8 byte counting without external dependencies
    return new TextEncoder().encode(content).length;
  }

  if (content instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(content))) {
    return content.byteLength;
  }

  if (ArrayBuffer.isView(content)) {
    return content.byteLength;
  }

  if (content instanceof ArrayBuffer) {
    return content.byteLength;
  }

  return 0;
}

export interface WriteSizeLimiterOptions {
  maxSizeBytes?: number;
  contentFields?: string[];
  enforceOnAllTools?: boolean;
}

/**
 * Creates SentinelRule to enforce maximum payload size for file write operations.
 */
export function createWriteSizeLimiterRule(options?: WriteSizeLimiterOptions): SentinelRule {
  const maxBytes = options?.maxSizeBytes ?? DEFAULT_MAX_WRITE_BYTES;
  const contentFields = options?.contentFields || DEFAULT_WRITE_CONTENT_FIELDS;
  const enforceAll = options?.enforceOnAllTools ?? false;

  return {
    id: 'fs-limit-file-write-size',
    name: 'Enforce File Write Size Ceiling Limit',
    category: 'fs',
    priority: 910,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Check if tool name resembles write operation unless enforceAll is true
      const isWriteTool = WRITE_TOOL_PATTERN.test(ctx.toolName);
      if (!isWriteTool && !enforceAll) {
        return null;
      }

      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      for (const field of contentFields) {
        if (field in ctx.params) {
          const val = ctx.params[field];
          const byteLength = getContentByteLength(val);

          if (byteLength > maxBytes) {
            const sizeMB = (byteLength / (1024 * 1024)).toFixed(2);
            const limitMB = (maxBytes / (1024 * 1024)).toFixed(2);

            return {
              ruleId: 'fs-limit-file-write-size',
              ruleName: 'Enforce File Write Size Ceiling Limit',
              severity: 'high',
              verdict: Verdict.BLOCK,
              reason: `File write payload in '${field}' (${sizeMB} MB / ${byteLength} bytes) exceeds ceiling limit of ${limitMB} MB (${maxBytes} bytes)`,
            };
          }
        }
      }

      return null;
    },
  };
}

export const writeSizeLimiterRule: SentinelRule = createWriteSizeLimiterRule();
