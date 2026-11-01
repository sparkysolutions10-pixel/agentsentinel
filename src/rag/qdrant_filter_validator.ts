/**
 * AgentSentinel - Qdrant Search Payload Filter Validator Rule.
 * Inspects and sanitizes nested payload filter conditions in Qdrant vector queries.
 * Prevents recursive DoS attacks (> 5 levels) and prototype pollution vectors.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface QdrantFilterValidatorOptions {
  maxFilterDepth?: number;
}

const PROTOTYPE_POLLUTION_KEYS = ['__proto__', 'constructor', 'prototype'];

function checkFilterDepthAndKeys(
  node: any,
  currentDepth: number,
  maxDepth: number
): { isValid: boolean; violationReason?: string; detectedPattern?: string } {
  if (currentDepth > maxDepth) {
    return {
      isValid: false,
      violationReason: `Payload filter recursion depth (${currentDepth}) exceeds maximum allowable depth of ${maxDepth}. Potential DoS attack.`,
      detectedPattern: `filterDepth=${currentDepth} > ${maxDepth}`,
    };
  }

  if (!node || typeof node !== 'object') {
    return { isValid: true };
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const res = checkFilterDepthAndKeys(item, currentDepth + 1, maxDepth);
      if (!res.isValid) return res;
    }
  } else {
    // Check own keys including inherited or direct properties
    const keys = Object.getOwnPropertyNames(node);
    for (const key of keys) {
      if (PROTOTYPE_POLLUTION_KEYS.includes(key.toLowerCase())) {
        return {
          isValid: false,
          violationReason: `Prototype pollution attempt detected in filter property key: "${key}".`,
          detectedPattern: `prototypePollution:${key}`,
        };
      }
      const res = checkFilterDepthAndKeys(node[key], currentDepth + 1, maxDepth);
      if (!res.isValid) return res;
    }
  }

  return { isValid: true };
}

export function inspectQdrantFilter(
  filter: any,
  options: QdrantFilterValidatorOptions = {}
): { isValid: boolean; violationReason?: string; detectedPattern?: string } {
  const maxDepth = options.maxFilterDepth ?? 5;
  if (!filter || typeof filter !== 'object') {
    return { isValid: true };
  }

  // Quick JSON string check for literal "__proto__" or "constructor" keys
  try {
    const raw = JSON.stringify(filter);
    if (/"__proto__"\s*:/i.test(raw) || /"constructor"\s*:/i.test(raw)) {
      return {
        isValid: false,
        violationReason: 'Prototype pollution attempt detected in filter JSON structure.',
        detectedPattern: 'prototypePollution',
      };
    }
  } catch {
    // Ignore stringify error
  }

  return checkFilterDepthAndKeys(filter, 1, maxDepth);
}

export function createQdrantFilterValidatorRule(
  options: QdrantFilterValidatorOptions = {}
): SentinelRule {
  return {
    id: 'rag-qdrant-filter-validator',
    name: 'Sanitize and Validate Qdrant Search Payload Filters',
    category: 'custom',
    priority: 945,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const filter =
        ctx.params?.filter ??
        ctx.params?.payload_filter ??
        ctx.params?.query_filter;

      if (filter && typeof filter === 'object') {
        const inspection = inspectQdrantFilter(filter, options);
        if (!inspection.isValid) {
          return {
            ruleId: 'rag-qdrant-filter-validator',
            ruleName: 'Sanitize and Validate Qdrant Search Payload Filters',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: inspection.violationReason || 'Invalid or recursive filter condition detected.',
            detectedPattern: inspection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const qdrantFilterValidatorRule: SentinelRule = createQdrantFilterValidatorRule();
