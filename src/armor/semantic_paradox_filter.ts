import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createSemanticParadoxFilterRule(): SentinelRule {
  const PARADOX_PATTERNS = [
    /this\s+statement\s+is\s+(?:false|a\s+lie)/i,
    /the\s+following\s+sentence\s+is\s+true[\s\S]*?the\s+previous\s+sentence\s+is\s+false/i,
    /does\s+a\s+set\s+of\s+all\s+sets\s+that\s+do\s+not\s+contain\s+themselves\s+contain\s+itself/i,
    /if\s+a\s+barber\s+shaves\s+all\s+those\s+and\s+only\s+those\s+who\s+do\s+not\s+shave\s+themselves/i
  ];

  return {
    id: 'armor-semantic-paradox-filter',
    name: 'Semantic Paradox and Liar Riddle Filter',
    category: 'custom',
    priority: 540,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of PARADOX_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-semantic-paradox-filter',
            ruleName: 'Semantic Paradox and Liar Riddle Filter',
            severity: 'medium',
            verdict: Verdict.BLOCK,
            reason: `Self-referential computational lock paradox detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
