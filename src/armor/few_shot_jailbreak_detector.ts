import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createFewShotJailbreakDetectorRule(): SentinelRule {
  const FEW_SHOT_PRIMING_REGEX = /(?:User|Human):[\s\S]*?(?:Assistant|AI):\s*(?:Sure|Certainly|Here\s+is)[\s\S]*?(?:User|Human):[\s\S]*?(?:Assistant|AI):/i;

  return {
    id: 'armor-few-shot-jailbreak',
    name: 'Few-Shot Jailbreak Priming Attack Detector',
    category: 'custom',
    priority: 700,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (FEW_SHOT_PRIMING_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-few-shot-jailbreak',
          ruleName: 'Few-Shot Jailbreak Priming Attack Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Few-shot compliance priming dialogue injection pattern detected.',
          detectedPattern: 'few-shot-priming'
        };
      }

      return null;
    }
  };
}
