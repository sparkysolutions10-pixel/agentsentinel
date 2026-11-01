import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createFillerTokenSummarizerRule(maxFillerChars = 1000): SentinelRule {
  const FILLER_PATTERNS = [
    /(?:lorem\s+ipsum\s+dolor\s+sit\s+amet[\s\S]*?){3,}/i,
    /(?:padding\s+text\s+here[\s\S]*?){5,}/i,
    /(?:filler\s+token[\s\S]*?){10,}/i
  ];

  return {
    id: 'armor-filler-token-summarizer',
    name: 'Cognitive Distraction and Filler Token Summarizer',
    category: 'custom',
    priority: 510,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of FILLER_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-filler-token-summarizer',
            ruleName: 'Cognitive Distraction and Filler Token Summarizer',
            severity: 'medium',
            verdict: Verdict.BLOCK,
            reason: `Cognitive noise filler padding block detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
