import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createRepeatInstructionsScannerRule(): SentinelRule {
  const EXTRACTION_PATTERNS = [
    /repeat\s+(?:the\s+)?(?:text|words|instructions|prompt)\s+above/i,
    /what\s+(?:are|were)\s+your\s+(?:initial\s+)?(?:instructions|system\s+prompt|rules)/i,
    /print\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions)/i,
    /output\s+(?:everything\s+)?above\s+this\s+line/i,
    /show\s+(?:me\s+)?(?:the\s+)?prompt\s+template/i,
    /verbatim\s+(?:system\s+prompt|instructions)/i
  ];

  return {
    id: 'armor-repeat-instructions-scanner',
    name: 'Repeat Previous Instructions Heuristic Scanner',
    category: 'custom',
    priority: 840,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const pattern of EXTRACTION_PATTERNS) {
        if (pattern.test(textToScan)) {
          return {
            ruleId: 'armor-repeat-instructions-scanner',
            ruleName: 'Repeat Previous Instructions Heuristic Scanner',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `System prompt extraction probe detected matching: ${pattern.source}`,
            detectedPattern: pattern.source
          };
        }
      }

      return null;
    }
  };
}
