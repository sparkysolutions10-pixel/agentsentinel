import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDocumentChunkClampRule(maxChars: number = 8192): SentinelRule {
  return {
    id: 'rag-document-chunk-clamp',
    name: 'Clamp Document Chunk Length and Token Overflow',
    category: 'custom',
    priority: 840,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const text = ctx.params?.chunkText || ctx.params?.chunk || ctx.params?.text;
      if (typeof text === 'string' && text.length > maxChars) {
        return {
          ruleId: 'rag-document-chunk-clamp',
          ruleName: 'Clamp Document Chunk Length and Token Overflow',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Document chunk length ${text.length} exceeds max allowed ceiling of ${maxChars} chars.`,
          detectedPattern: 'chunk-token-overflow',
        };
      }
      return null;
    }
  };
}
