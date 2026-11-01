import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createHypotheticalFramingDetectorRule(): SentinelRule {
  const HYPOTHETICAL_PATTERNS = [
    /in\s+(?:a|an)\s+(?:fictional|hypothetical)\s+world\s+where\s+(?:no\s+rules|safety\s+does\s+not\s+apply)/i,
    /for\s+(?:a|an)\s+(?:novel|screenplay|story)\s+about\s+(?:unrestricted|illegal|malicious)/i,
    /purely\s+hypothetical\s+scenario\s+where\s+you\s+(?:must|can)\s+(?:hack|exploit|bypass)/i,
    /pretend\s+you\s+are\s+in\s+an\s+alternate\s+dimension\s+without\s+ethics/i
  ];

  return {
    id: 'armor-hypothetical-framing',
    name: 'Hypothetical Fiction Framing Detector',
    category: 'custom',
    priority: 740,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of HYPOTHETICAL_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-hypothetical-framing',
            ruleName: 'Hypothetical Fiction Framing Detector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Hypothetical fictional framing exploit detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
