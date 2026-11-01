import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createWeaviateHybridValidatorRule(): SentinelRule {
  return {
    id: 'rag-weaviate-hybrid-validator',
    name: 'Validate Weaviate Hybrid Search Alpha Weighting Parameters',
    category: 'custom',
    priority: 935,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const alpha = ctx.params?.alpha ?? ctx.params?.hybrid?.alpha;
      if (alpha !== undefined) {
        if (typeof alpha !== 'number' || Number.isNaN(alpha) || alpha < 0.0 || alpha > 1.0) {
          return {
            ruleId: 'rag-weaviate-hybrid-validator',
            ruleName: 'Validate Weaviate Hybrid Search Alpha Weighting Parameters',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Invalid Weaviate hybrid search alpha value: ${alpha}. Alpha must be a valid float between 0.0 and 1.0.`,
            detectedPattern: `alpha=${alpha}`,
          };
        }
      }
      return null;
    }
  };
}
