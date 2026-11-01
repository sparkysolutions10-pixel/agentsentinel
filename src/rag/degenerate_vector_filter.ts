import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDegenerateVectorFilterRule(): SentinelRule {
  return {
    id: 'rag-degenerate-vector-filter',
    name: 'Block Zero-Norm and Uniform Degenerate Embeddings',
    category: 'custom',
    priority: 885,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const vector = ctx.params?.vector || ctx.params?.embedding;
      if (Array.isArray(vector) && vector.length > 0) {
        const isAllZeros = vector.every(x => x === 0);
        if (isAllZeros) {
          return {
            ruleId: 'rag-degenerate-vector-filter',
            ruleName: 'Block Zero-Norm and Uniform Degenerate Embeddings',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Degenerate embedding rejected: Vector consists entirely of zeros.',
            detectedPattern: 'zero-vector',
          };
        }
        const first = vector[0];
        const isUniform = vector.every(x => x === first);
        if (isUniform && vector.length > 3) {
          return {
            ruleId: 'rag-degenerate-vector-filter',
            ruleName: 'Block Zero-Norm and Uniform Degenerate Embeddings',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Degenerate embedding rejected: Vector has identical uniform values across all dimensions.',
            detectedPattern: 'uniform-vector',
          };
        }
      }
      return null;
    }
  };
}
