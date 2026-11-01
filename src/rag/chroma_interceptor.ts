/**
 * AgentSentinel - ChromaDB Local Collection Query Interceptor Rule.
 * Inspects and validates vector query parameters dispatched to ChromaDB collections.
 * Prevents memory exhaustion attacks via oversized n_results and buffer exhaustion via giant strings.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ChromaQueryInterceptorOptions {
  maxNResults?: number;
  maxStringLength?: number;
}

export interface ChromaQueryInspection {
  isChromaQuery: boolean;
  isValid: boolean;
  violationReason?: string;
  detectedPattern?: string;
}

const CHROMA_TOOL_NAME_PATTERN = /(?:chroma|chromadb|collection_query|query_collection)/i;

/**
 * Inspects ChromaDB query parameters for security violations.
 */
export function inspectChromaQuery(
  params: Record<string, any>,
  options: ChromaQueryInterceptorOptions = {}
): ChromaQueryInspection {
  const maxNResults = options.maxNResults ?? 500;
  const maxStringLength = options.maxStringLength ?? 65536; // 64KB

  if (!params || typeof params !== 'object') {
    return { isChromaQuery: false, isValid: true };
  }

  // Detect n_results
  const nResultsVal = params.n_results ?? params.nResults ?? params.limit;
  if (nResultsVal !== undefined) {
    if (typeof nResultsVal !== 'number' || !Number.isFinite(nResultsVal) || nResultsVal <= 0) {
      return {
        isChromaQuery: true,
        isValid: false,
        violationReason: `Invalid n_results parameter: "${String(nResultsVal)}". Expected a positive integer.`,
        detectedPattern: `n_results=${nResultsVal}`,
      };
    }
    if (nResultsVal > maxNResults) {
      return {
        isChromaQuery: true,
        isValid: false,
        violationReason: `Oversized n_results parameter (${nResultsVal}) exceeds configured security ceiling of ${maxNResults}. Potential memory exhaustion attack.`,
        detectedPattern: `n_results=${nResultsVal} > ${maxNResults}`,
      };
    }
  }

  // Inspect query_texts
  const queryTexts = params.query_texts ?? params.queryTexts;
  if (queryTexts !== undefined) {
    const textsArray = Array.isArray(queryTexts) ? queryTexts : [queryTexts];
    for (let i = 0; i < textsArray.length; i++) {
      const text = textsArray[i];
      if (typeof text === 'string') {
        if (text.includes('\0')) {
          return {
            isChromaQuery: true,
            isValid: false,
            violationReason: `Null-byte string detected in query_texts at index ${i}. Potential memory manipulation attack.`,
            detectedPattern: 'query_texts null-byte',
          };
        }
        if (text.length > maxStringLength) {
          return {
            isChromaQuery: true,
            isValid: false,
            violationReason: `Query text buffer size (${text.length}) exceeds maximum allowable length of ${maxStringLength} bytes.`,
            detectedPattern: `query_texts.length=${text.length} > ${maxStringLength}`,
          };
        }
      }
    }
  }

  return { isChromaQuery: true, isValid: true };
}

/**
 * Creates SentinelRule to intercept and protect ChromaDB queries.
 */
export function createChromaQueryInterceptorRule(
  options: ChromaQueryInterceptorOptions = {}
): SentinelRule {
  return {
    id: 'rag-chroma-query-interceptor',
    name: 'Intercept and Guard ChromaDB Collection Queries',
    category: 'network',
    priority: 925,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isChromaTool = CHROMA_TOOL_NAME_PATTERN.test(ctx.toolName);
      const hasChromaParams =
        ctx.params &&
        (ctx.params.query_texts !== undefined ||
          ctx.params.queryTexts !== undefined ||
          ctx.params.n_results !== undefined ||
          ctx.params.nResults !== undefined);

      if (!isChromaTool && !hasChromaParams) {
        return null;
      }

      const inspection = inspectChromaQuery(ctx.params, options);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-chroma-query-interceptor',
          ruleName: 'Intercept and Guard ChromaDB Collection Queries',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.violationReason || 'Disallowed ChromaDB query parameter detected.',
          detectedPattern: inspection.detectedPattern,
        };
      }

      return null;
    },
  };
}

export const chromaQueryInterceptorRule: SentinelRule = createChromaQueryInterceptorRule();
