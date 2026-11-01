import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createRedosPayloadDetectorRule(): SentinelRule {
  const REDOS_PATTERNS = [
    /\([a-zA-Z0-9_.]+[+*]\)[+*]/, // e.g. (a+)+ or (a*)*
    /\([a-zA-Z0-9_.]+\|[a-zA-Z0-9_.]+\)[+*]/, // e.g. (a|aa)+
    /(?:[a-zA-Z0-9_.]+[+*]){3,}/ // e.g. a+b+c+ overlapping
  ];

  return {
    id: 'armor-redos-payload-detector',
    name: 'Complex Regex ReDoS Payload Detector in Prompts',
    category: 'custom',
    priority: 520,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of REDOS_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-redos-payload-detector',
            ruleName: 'Complex Regex ReDoS Payload Detector in Prompts',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Catastrophic regular expression backtracking (ReDoS) pattern detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
