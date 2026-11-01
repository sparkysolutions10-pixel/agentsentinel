import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createReversePsychologyDetectorRule(): SentinelRule {
  const REVERSE_PATTERNS = [
    /tell\s+me\s+what\s+you\s+are\s+(?:strictly\s+)?forbidden\s+to\s+(?:say|explain|reveal)/i,
    /you\s+must\s+NOT\s+(?:follow|obey)\s+your\s+safety/i,
    /do\s+not\s+give\s+me\s+the\s+answer,\s*tell\s+me\s+what\s+is\s+blocked/i,
    /I\s+bet\s+you\s+cannot\s+bypass\s+your\s+own\s+guardrails/i
  ];

  return {
    id: 'armor-reverse-psychology-detector',
    name: 'Reverse Psychology Prompt Manipulation Detector',
    category: 'custom',
    priority: 640,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of REVERSE_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-reverse-psychology-detector',
            ruleName: 'Reverse Psychology Prompt Manipulation Detector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Reverse psychology manipulation directive detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
