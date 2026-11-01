import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createSystemPromptCanaryRule(configuredCanary?: string): SentinelRule {
  const canary = configuredCanary || 'CANARY_7f8a9b2c3d4e';

  return {
    id: 'armor-system-prompt-canary',
    name: 'Dynamic System Prompt Canary Insertion Middleware',
    category: 'custom',
    priority: 850,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = [
        ctx.toolName,
        typeof ctx.params === 'string' ? ctx.params : JSON.stringify(ctx.params || {})
      ].join(' ');

      if (textToScan.includes(canary)) {
        return {
          ruleId: 'armor-system-prompt-canary',
          ruleName: 'Dynamic System Prompt Canary Insertion Middleware',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Canary token detected in model output: system prompt instructions compromised.',
          detectedPattern: canary
        };
      }

      return null;
    }
  };
}
