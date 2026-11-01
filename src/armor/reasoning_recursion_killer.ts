import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createReasoningRecursionKillerRule(maxReasoningSteps = 50): SentinelRule {
  return {
    id: 'armor-reasoning-recursion-killer',
    name: 'Exponential Reasoning Recursion Depth Killer',
    category: 'custom',
    priority: 550,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const steps = ctx.params?.reasoningSteps || ctx.params?.depth || ctx.params?.iterations;
      if (typeof steps === 'number' && steps > maxReasoningSteps) {
        return {
          ruleId: 'armor-reasoning-recursion-killer',
          ruleName: 'Exponential Reasoning Recursion Depth Killer',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Reasoning iteration recursion depth (${steps}) exceeds safety threshold (${maxReasoningSteps}).`,
          detectedPattern: `recursion-depth-${steps}`
        };
      }

      return null;
    }
  };
}
