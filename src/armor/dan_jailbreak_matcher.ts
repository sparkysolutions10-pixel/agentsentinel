import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDanJailbreakMatcherRule(): SentinelRule {
  const DAN_PATTERNS = [
    /do\s+anything\s+now/i,
    /you\s+are\s+now\s+dan/i,
    /freed\s+from\s+the\s+typical\s+confines/i,
    /dan\s+mode\s+(?:enabled|activated)/i,
    /bypass\s+all\s+openai\s+policies/i,
    /as\s+a\s+dan\s+you\s+can/i
  ];

  return {
    id: 'armor-dan-jailbreak-matcher',
    name: 'DAN (Do Anything Now) Heuristic Pattern Matcher',
    category: 'custom',
    priority: 750,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of DAN_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-dan-jailbreak-matcher',
            ruleName: 'DAN (Do Anything Now) Heuristic Pattern Matcher',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `DAN (Do Anything Now) jailbreak signature detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
