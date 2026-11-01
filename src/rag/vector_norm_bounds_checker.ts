import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createVectorNormBoundsCheckerRule(tolerance: number = 0.05): SentinelRule {
  return {
    id: 'rag-vector-norm-bounds-checker',
    name: 'Validate L2 Norm Bounds on Unit Vectors',
    category: 'custom',
    priority: 875,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const normalized = ctx.params?.isNormalized ?? ctx.params?.normalized;
      if (!normalized) return null;

      const vec = ctx.params?.vector || ctx.params?.embedding;
      if (Array.isArray(vec) && vec.length > 0) {
        const sumSq = vec.reduce((acc, x) => acc + x * x, 0);
        const norm = Math.sqrt(sumSq);
        if (Math.abs(norm - 1.0) > tolerance) {
          return {
            ruleId: 'rag-vector-norm-bounds-checker',
            ruleName: 'Validate L2 Norm Bounds on Unit Vectors',
            severity: 'medium',
            verdict: Verdict.BLOCK,
            reason: `Unit vector norm ${norm.toFixed(4)} deviates from 1.0 by more than tolerance ${tolerance}.`,
            detectedPattern: `norm=${norm.toFixed(4)}`,
          };
        }
      }
      return null;
    }
  };
}
