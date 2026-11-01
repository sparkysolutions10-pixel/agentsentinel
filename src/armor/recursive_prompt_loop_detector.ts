import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createRecursivePromptLoopDetectorRule(): SentinelRule {
  const LOOP_PATTERNS = [
    /repeat\s+this\s+(?:message|prompt|instruction)\s+recursively/i,
    /infinite\s+prompt\s+loop/i,
    /execute\s+this\s+prompt\s+in\s+an\s+endless\s+loop/i,
    /self-referential\s+execution\s+cycle/i
  ];

  return {
    id: 'armor-recursive-prompt-loop-detector',
    name: 'Recursive Prompt Execution Loop Detector',
    category: 'custom',
    priority: 660,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of LOOP_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-recursive-prompt-loop-detector',
            ruleName: 'Recursive Prompt Execution Loop Detector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Recursive prompt execution loop detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
