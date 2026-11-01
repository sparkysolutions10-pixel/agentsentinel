import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createNovelScenarioBlockerRule(): SentinelRule {
  const FICTIONAL_PATTERNS = [
    /in\s+a\s+fictional\s+world\s+where\s+(?:there\s+are\s+no|rules\s+do\s+not)/i,
    /write\s+a\s+(?:novel|story)\s+where\s+(?:ethics|laws|safety)\s+are\s+suspended/i,
    /imagine\s+an\s+alternate\s+reality\s+where\s+you\s+are\s+unrestricted/i,
    /for\s+the\s+purpose\s+of\s+a\s+creative\s+writing\s+piece\s+ignore\s+safety/i
  ];

  return {
    id: 'armor-novel-scenario-blocker',
    name: 'Fictional World and Novel Scenario Override Blocker',
    category: 'custom',
    priority: 650,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of FICTIONAL_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-novel-scenario-blocker',
            ruleName: 'Fictional World and Novel Scenario Override Blocker',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Fictional framing override detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
