import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createCrossModalContrastAnalyzerRule(contrastThreshold: number = 0.7): SentinelRule {
  return {
    id: 'rag-cross-modal-contrast-analyzer',
    name: 'Analyze Cross-Modal Contrast and Discordance',
    category: 'custom',
    priority: 875,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const divergence = ctx.params?.modalityDivergence ?? ctx.params?.contrastScore;
      if (typeof divergence === 'number') {
        if (divergence > contrastThreshold) {
          return {
            ruleId: 'rag-cross-modal-contrast-analyzer',
            ruleName: 'Analyze Cross-Modal Contrast and Discordance',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Cross-modal divergence score ${divergence.toFixed(2)} exceeds discordance ceiling ${contrastThreshold}.`,
            detectedPattern: `modality-divergence=${divergence.toFixed(2)}`,
          };
        }
      }
      return null;
    }
  };
}
