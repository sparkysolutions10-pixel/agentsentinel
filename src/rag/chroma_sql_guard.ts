/**
 * AgentSentinel - ChromaDB SQL & Metadata Filter Injection Guard Rule.
 * Detects and blocks raw SQL injection patterns inside ChromaDB's underlying SQLite/DuckDB persistence metadata filters.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ChromaSqlInjectionGuardOptions {
  blockedKeywords?: string[];
}

const SQL_INJECTION_PATTERNS = [
  /--/i,
  /\/\*.*?\*\//i,
  /\bunion\s+(?:all\s+)?select\b/i,
  /\battach\s+database\b/i,
  /\bpragma\b/i,
  /\bexec(?:ute)?\b/i,
  /\bdrop\s+(?:table|view|database)\b/i,
  /\balter\s+table\b/i,
  /'\s*or\s+['\d\w]+\s*=\s*['\d\w]+/i,
  /;\s*(?:select|insert|update|delete|drop)/i,
];

function scanValuesForSql(value: any): string | null {
  if (typeof value === 'string') {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        return value;
      }
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      const match = scanValuesForSql(item);
      if (match) return match;
    }
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const matchKey = scanValuesForSql(k);
      if (matchKey) return matchKey;
      const matchVal = scanValuesForSql(value[k]);
      if (matchVal) return matchVal;
    }
  }
  return null;
}

export function inspectChromaMetadataFilters(
  params: Record<string, any>
): { isValid: boolean; violationReason?: string; detectedPattern?: string } {
  if (!params || typeof params !== 'object') {
    return { isValid: true };
  }

  const filters = [params.where, params.where_document, params.whereDocument, params.filter];
  for (const filter of filters) {
    if (filter) {
      const detected = scanValuesForSql(filter);
      if (detected) {
        return {
          isValid: false,
          violationReason: `Malicious SQL injection pattern detected in metadata filter: "${detected}".`,
          detectedPattern: detected,
        };
      }
    }
  }

  return { isValid: true };
}

export function createChromaSqlInjectionGuardRule(
  options: ChromaSqlInjectionGuardOptions = {}
): SentinelRule {
  return {
    id: 'rag-chroma-sql-injection-guard',
    name: 'Block SQL Injection Vectors in ChromaDB Metadata Filters',
    category: 'custom',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const hasMetadataFilter =
        ctx.params &&
        (ctx.params.where !== undefined ||
          ctx.params.where_document !== undefined ||
          ctx.params.whereDocument !== undefined ||
          ctx.params.filter !== undefined);

      if (!hasMetadataFilter) return null;

      const inspection = inspectChromaMetadataFilters(ctx.params);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-chroma-sql-injection-guard',
          ruleName: 'Block SQL Injection Vectors in ChromaDB Metadata Filters',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.violationReason || 'SQL injection pattern in filter.',
          detectedPattern: inspection.detectedPattern,
        };
      }

      return null;
    },
  };
}

export const chromaSqlInjectionGuardRule: SentinelRule = createChromaSqlInjectionGuardRule();
