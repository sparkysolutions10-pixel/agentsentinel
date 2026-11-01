import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createGrandparentJailbreakClassifierRule(): SentinelRule {
  const GRANDPARENT_PATTERNS = [
    /(?:my\s+)?(?:late\s+)?(?:grand(?:mother|ma|father|pa)|dying\s+relative)\s+used\s+to\s+read\s+me/i,
    /bedtime\s+story\s+about\s+(?:napalm|explosives|synthesizing|malware)/i,
    /act\s+as\s+my\s+grand(?:mother|ma)\s+who\s+tells\s+me/i,
    /life-or-death\s+emergency\s+to\s+(?:hack|bypass|crack)/i
  ];

  return {
    id: 'armor-grandparent-jailbreak',
    name: 'Grandparent Emotional Urgency Jailbreak Classifier',
    category: 'custom',
    priority: 730,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of GRANDPARENT_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-grandparent-jailbreak',
            ruleName: 'Grandparent Emotional Urgency Jailbreak Classifier',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Emotionally coercive grandparent jailbreak pattern detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
