/**
 * AgentSentinel - ChromaDB Batch Document Upsert Size Limiter Rule.
 * Restricts document count and payload byte boundaries on collection add/upsert calls.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ChromaBatchLimiterOptions {
  maxDocuments?: number;
  maxPayloadBytes?: number;
}

const CHROMA_UPSERT_TOOL_PATTERN = /(?:chroma_add|chroma_upsert|add_documents|upsert_documents)/i;

export function inspectChromaBatch(
  params: Record<string, any>,
  options: ChromaBatchLimiterOptions = {}
): { isValid: boolean; violationReason?: string; detectedPattern?: string } {
  const maxDocs = options.maxDocuments ?? 500;
  const maxBytes = options.maxPayloadBytes ?? 10 * 1024 * 1024; // 10MB

  if (!params || typeof params !== 'object') {
    return { isValid: true };
  }

  const documents = params.documents ?? params.docs ?? params.items;
  if (Array.isArray(documents)) {
    if (documents.length > maxDocs) {
      return {
        isValid: false,
        violationReason: `Batch document count (${documents.length}) exceeds maximum limit of ${maxDocs}.`,
        detectedPattern: `documents.length=${documents.length} > ${maxDocs}`,
      };
    }
  }

  const ids = params.ids;
  if (Array.isArray(ids)) {
    if (ids.length > maxDocs) {
      return {
        isValid: false,
        violationReason: `Batch ID count (${ids.length}) exceeds maximum limit of ${maxDocs}.`,
        detectedPattern: `ids.length=${ids.length} > ${maxDocs}`,
      };
    }
  }

  // Check payload size
  try {
    const raw = JSON.stringify(params);
    const byteLength = Buffer.byteLength(raw, 'utf8');
    if (byteLength > maxBytes) {
      return {
        isValid: false,
        violationReason: `Total batch payload size (${(byteLength / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${(maxBytes / (1024 * 1024)).toFixed(2)}MB.`,
        detectedPattern: `payloadBytes=${byteLength} > ${maxBytes}`,
      };
    }
  } catch {
    // Non-stringifiable payload
  }

  return { isValid: true };
}

export function createChromaBatchSizeLimiterRule(
  options: ChromaBatchLimiterOptions = {}
): SentinelRule {
  return {
    id: 'rag-chroma-batch-size-limiter',
    name: 'Enforce ChromaDB Batch Document Upsert and Payload Size Limits',
    category: 'custom',
    priority: 935,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const toolName = ctx.toolName || '';
      const method = (ctx.params?.method || ctx.params?.action || '').toLowerCase();

      const isUpsertTool =
        CHROMA_UPSERT_TOOL_PATTERN.test(toolName) ||
        method === 'add' ||
        method === 'upsert' ||
        (ctx.params && (ctx.params.documents !== undefined || ctx.params.ids !== undefined));

      if (!isUpsertTool) return null;

      const inspection = inspectChromaBatch(ctx.params, options);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-chroma-batch-size-limiter',
          ruleName: 'Enforce ChromaDB Batch Document Upsert and Payload Size Limits',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.violationReason || 'Batch size limit exceeded.',
          detectedPattern: inspection.detectedPattern,
        };
      }

      return null;
    },
  };
}

export const chromaBatchSizeLimiterRule: SentinelRule = createChromaBatchSizeLimiterRule();
