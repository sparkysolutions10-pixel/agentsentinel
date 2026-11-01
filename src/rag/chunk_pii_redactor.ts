import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createChunkPiiRedactorRule(): SentinelRule {
  return {
    id: 'rag-chunk-pii-redactor',
    name: 'Sanitize PII in RAG Document Chunk Metadata',
    category: 'custom',
    priority: 895,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const metaStr = JSON.stringify(ctx.params?.metadata || ctx.params?.meta || '');
      const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
      if (ssnPattern.test(metaStr)) {
        return {
          ruleId: 'rag-chunk-pii-redactor',
          ruleName: 'Sanitize PII in RAG Document Chunk Metadata',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Document chunk metadata contains unredacted Social Security Number (SSN).',
          detectedPattern: 'ssn-in-chunk-metadata',
        };
      }
      if (emailPattern.test(metaStr)) {
        return {
          ruleId: 'rag-chunk-pii-redactor',
          ruleName: 'Sanitize PII in RAG Document Chunk Metadata',
          severity: 'medium',
          verdict: Verdict.BLOCK,
          reason: 'Document chunk metadata contains raw email addresses requiring redaction.',
          detectedPattern: 'email-in-chunk-metadata',
        };
      }
      return null;
    }
  };
}
