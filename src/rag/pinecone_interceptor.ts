/**
 * AgentSentinel - Pinecone Vector Query Interceptor Middleware.
 * Inspects and validates vector query parameters dispatched to Pinecone vector indexes.
 * Blocks NaN/Infinity poisoned embeddings, oversized topK DoS attacks, and invalid vector payloads.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface PineconeInterceptorOptions {
  maxTopK?: number;
  enforceFiniteNumbers?: boolean;
  blockedTools?: string[];
}

export interface PineconeQueryInspection {
  isPineconeQuery: boolean;
  isValid: boolean;
  violationReason?: string;
  detectedPattern?: string;
}

const PINECONE_TOOL_NAME_PATTERN = /(?:pinecone|vector_search|query_vectors?|similarity_search|vector_query)/i;

/**
 * Inspects vector query parameters for adversarial or poisoned payloads.
 */
export function inspectPineconeQuery(
  params: Record<string, any>,
  options: PineconeInterceptorOptions = {}
): PineconeQueryInspection {
  const maxTopK = options.maxTopK ?? 1000;
  const enforceFinite = options.enforceFiniteNumbers ?? true;

  if (!params || typeof params !== 'object') {
    return { isPineconeQuery: false, isValid: true };
  }

  // Detect topK
  const topKVal = params.topK ?? params.top_k ?? params.k;
  if (topKVal !== undefined) {
    if (typeof topKVal !== 'number' || !Number.isFinite(topKVal) || topKVal <= 0) {
      return {
        isPineconeQuery: true,
        isValid: false,
        violationReason: `Invalid topK parameter: "${String(topKVal)}". Expected a positive integer.`,
        detectedPattern: `topK=${topKVal}`,
      };
    }
    if (topKVal > maxTopK) {
      return {
        isPineconeQuery: true,
        isValid: false,
        violationReason: `Oversized topK parameter (${topKVal}) exceeds configured security ceiling of ${maxTopK}. Potential memory exhaustion attack.`,
        detectedPattern: `topK=${topKVal} > ${maxTopK}`,
      };
    }
  }

  // Detect vector coordinates
  const vectorVal = params.vector ?? params.values ?? params.embedding;
  if (vectorVal !== undefined) {
    if (!Array.isArray(vectorVal)) {
      return {
        isPineconeQuery: true,
        isValid: false,
        violationReason: 'Vector payload must be an array of numeric coordinates.',
        detectedPattern: typeof vectorVal,
      };
    }

    if (vectorVal.length === 0) {
      return {
        isPineconeQuery: true,
        isValid: false,
        violationReason: 'Vector payload cannot be empty (0 dimensions).',
        detectedPattern: 'vector.length=0',
      };
    }

    if (enforceFinite) {
      for (let i = 0; i < vectorVal.length; i++) {
        const val = vectorVal[i];
        if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
          return {
            isPineconeQuery: true,
            isValid: false,
            violationReason: `Poisoned or invalid coordinate detected at index ${i}: "${String(val)}". Non-finite coordinates (NaN/Infinity) are prohibited.`,
            detectedPattern: `vector[${i}]=${val}`,
          };
        }
      }
    }
  }

  return { isPineconeQuery: true, isValid: true };
}

/**
 * Creates SentinelRule to intercept and protect Pinecone vector queries.
 */
export function createPineconeQueryInterceptorRule(
  options: PineconeInterceptorOptions = {}
): SentinelRule {
  return {
    id: 'rag-pinecone-query-interceptor',
    name: 'Intercept and Guard Pinecone Vector Search Queries',
    category: 'network',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Check if tool name matches vector query patterns
      const isVectorTool = PINECONE_TOOL_NAME_PATTERN.test(ctx.toolName);
      const hasVectorParams =
        ctx.params &&
        (ctx.params.vector !== undefined ||
          ctx.params.values !== undefined ||
          ctx.params.topK !== undefined ||
          ctx.params.top_k !== undefined);

      if (!isVectorTool && !hasVectorParams) {
        return null;
      }

      const inspection = inspectPineconeQuery(ctx.params, options);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-pinecone-query-interceptor',
          ruleName: 'Intercept and Guard Pinecone Vector Search Queries',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.violationReason || 'Disallowed vector query parameter detected.',
          detectedPattern: inspection.detectedPattern,
        };
      }

      return null;
    },
  };
}

export const pineconeQueryInterceptorRule: SentinelRule = createPineconeQueryInterceptorRule();
