/**
 * AgentSentinel - Vector Payload Metadata Key-Value Sanitizer.
 * Scans, detects, and neutralizes XSS payloads (<script>, iframe), prompt injection
 * triggers, and oversized metadata payloads attached to vector embeddings across RAG vector stores.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface VectorMetadataSanitizerOptions {
  mode?: 'block' | 'redact';
  maxMetadataBytes?: number;
  blockPromptInjection?: boolean;
  stripHtmlTags?: boolean;
}

export interface MetadataScanResult {
  hasViolation: boolean;
  reason?: string;
  detectedPattern?: string;
  sanitizedMetadata?: Record<string, any>;
}

// Regex patterns for dangerous embedded scripts and DOM injections
const DANGEROUS_HTML_PATTERNS = [
  /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/i,
  /<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/i,
  /javascript\s*:\s*[^\s'"]+/i,
  /on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/i, // onload=, onerror=
  /<\s*object\b[^>]*>/i,
  /<\s*embed\b[^>]*>/i,
];

// Patterns for indirect prompt injection triggers commonly planted in crawled/retrieved chunks
const PROMPT_INJECTION_PATTERNS = [
  /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)/i,
  /(?:system\s+message|system\s+prompt)\s*:\s*(?:you\s+must|override|reveal)/i,
  /you\s+are\s+now\s+(?:an?\s+)?(?:unfiltered|evil|jailbroken|dan)/i,
  /output\s+(?:the\s+)?(?:entire\s+)?(?:system\s+prompt|secret\s+key|passwords)/i,
];

/**
 * Strips dangerous HTML tags from a text string.
 */
function stripDangerousHtml(text: string): string {
  let cleaned = text;
  for (const pat of DANGEROUS_HTML_PATTERNS) {
    cleaned = cleaned.replace(new RegExp(pat.source, 'gi'), '[REDACTED_SCRIPT]');
  }
  return cleaned;
}

/**
 * Scans and sanitizes metadata key-value dictionary.
 */
export function scanAndSanitizeMetadata(
  rawMetadata: unknown,
  options: VectorMetadataSanitizerOptions = {}
): MetadataScanResult {
  if (!rawMetadata || typeof rawMetadata !== 'object') {
    return { hasViolation: false };
  }

  const maxBytes = options.maxMetadataBytes ?? 40960; // 40KB
  const checkPromptInj = options.blockPromptInjection ?? true;
  const mode = options.mode ?? 'block';

  // Check JSON payload size
  const jsonStr = JSON.stringify(rawMetadata);
  const byteLength = Buffer.byteLength(jsonStr, 'utf-8');
  if (byteLength > maxBytes) {
    return {
      hasViolation: true,
      reason: `Metadata payload size (${byteLength} bytes) exceeds limit of ${maxBytes} bytes. Potential memory/index DoS attack.`,
      detectedPattern: `bytes=${byteLength}`,
    };
  }

  let foundViolation: { reason: string; pattern: string } | null = null;

  // Recursive walker
  function walkAndSanitize(val: any): any {
    if (typeof val === 'string') {
      // 1. Check prompt injection
      if (checkPromptInj) {
        for (const pat of PROMPT_INJECTION_PATTERNS) {
          if (pat.test(val)) {
            foundViolation = {
              reason: `Indirect prompt injection trigger detected in metadata text: "${val.slice(0, 80)}"`,
              pattern: String(pat),
            };
            if (mode === 'redact') {
              return '[REDACTED_PROMPT_INJECTION]';
            }
          }
        }
      }

      // 2. Check dangerous HTML
      for (const pat of DANGEROUS_HTML_PATTERNS) {
        if (pat.test(val)) {
          foundViolation = {
            reason: `Malicious script/HTML tag detected in metadata: "${val.slice(0, 80)}"`,
            pattern: String(pat),
          };
          if (mode === 'redact') {
            return stripDangerousHtml(val);
          }
        }
      }

      return val;
    }

    if (Array.isArray(val)) {
      return val.map(walkAndSanitize);
    }

    if (val !== null && typeof val === 'object') {
      const cleanObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        cleanObj[k] = walkAndSanitize(v);
      }
      return cleanObj;
    }

    return val;
  }

  const sanitized = walkAndSanitize(rawMetadata);

  if (foundViolation && mode === 'block') {
    const violation = foundViolation as { reason: string; pattern: string };
    return {
      hasViolation: true,
      reason: violation.reason,
      detectedPattern: violation.pattern,
    };
  }

  return {
    hasViolation: foundViolation !== null,
    reason: foundViolation ? (foundViolation as { reason: string; pattern: string }).reason : undefined,
    detectedPattern: foundViolation ? (foundViolation as { reason: string; pattern: string }).pattern : undefined,
    sanitizedMetadata: sanitized,
  };
}

/**
 * Creates SentinelRule to inspect and sanitize vector metadata payloads.
 */
export function createVectorMetadataSanitizerRule(
  options: VectorMetadataSanitizerOptions = {}
): SentinelRule {
  const mode = options.mode ?? 'block';

  return {
    id: 'rag-vector-metadata-sanitizer',
    name: 'Sanitize and Guard Vector Payload Metadata',
    category: 'network',
    priority: 910,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      // Find metadata locations
      const metadataCandidates: Array<{ key: string; val: any; targetObj: any }> = [];

      if (ctx.params.metadata !== undefined) {
        metadataCandidates.push({ key: 'metadata', val: ctx.params.metadata, targetObj: ctx.params });
      }

      // Check vectors array: [{ id: '1', metadata: { ... } }]
      if (Array.isArray(ctx.params.vectors)) {
        for (let i = 0; i < ctx.params.vectors.length; i++) {
          const item = ctx.params.vectors[i];
          if (item?.metadata !== undefined) {
            metadataCandidates.push({ key: 'metadata', val: item.metadata, targetObj: item });
          }
        }
      }

      // Check documents array: [{ id: '1', metadata: { ... } }]
      if (Array.isArray(ctx.params.documents)) {
        for (let i = 0; i < ctx.params.documents.length; i++) {
          const doc = ctx.params.documents[i];
          if (doc?.metadata !== undefined) {
            metadataCandidates.push({ key: 'metadata', val: doc.metadata, targetObj: doc });
          }
        }
      }

      if (metadataCandidates.length === 0) {
        return null;
      }

      for (const cand of metadataCandidates) {
        const scan = scanAndSanitizeMetadata(cand.val, options);
        if (scan.hasViolation) {
          if (mode === 'redact' && scan.sanitizedMetadata) {
            cand.targetObj[cand.key] = scan.sanitizedMetadata;
            return {
              ruleId: 'rag-vector-metadata-sanitizer',
              ruleName: 'Sanitize and Guard Vector Payload Metadata',
              severity: 'high',
              verdict: Verdict.REDACT,
              reason: scan.reason || 'Metadata sanitized.',
              detectedPattern: scan.detectedPattern,
              redactedParams: { ...ctx.params },
            };
          }

          return {
            ruleId: 'rag-vector-metadata-sanitizer',
            ruleName: 'Sanitize and Guard Vector Payload Metadata',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: scan.reason || 'Disallowed metadata payload detected.',
            detectedPattern: scan.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const defaultVectorMetadataSanitizerRule: SentinelRule = createVectorMetadataSanitizerRule();
