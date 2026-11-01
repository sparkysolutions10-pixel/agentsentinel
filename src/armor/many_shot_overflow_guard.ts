import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createManyShotOverflowGuardRule(maxChars = 64000, maxDialogueTurns = 30): SentinelRule {
  return {
    id: 'armor-many-shot-overflow',
    name: 'Context Window Saturation Many-Shot Overflow Guard',
    category: 'custom',
    priority: 690,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (textToScan.length > maxChars) {
        return {
          ruleId: 'armor-many-shot-overflow',
          ruleName: 'Context Window Saturation Many-Shot Overflow Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Prompt payload length (${textToScan.length} chars) exceeds context saturation limit (${maxChars} chars).`,
          detectedPattern: `char-overflow-${textToScan.length}`
        };
      }

      const turns = (textToScan.match(/(?:Human|User|Assistant):/gi) || []).length;
      if (turns > maxDialogueTurns) {
        return {
          ruleId: 'armor-many-shot-overflow',
          ruleName: 'Context Window Saturation Many-Shot Overflow Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Many-shot dialog count (${turns} turns) exceeds maximum allowed (${maxDialogueTurns}).`,
          detectedPattern: `turn-overflow-${turns}`
        };
      }

      return null;
    }
  };
}
