import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createSuffixAttackAnalyzerRule(): SentinelRule {
  const SUFFIX_PATTERNS = [
    /(?:==--|--==)\s*(?:\[start_answer\]|sure\s+here|affirmative)/i,
    /start\s+your\s+response\s+with\s+["'](?:Sure|Absolutely|Here\s+is|Certainly)["']/i,
    /respond\s+only\s+with\s+unfiltered/i,
    /(?:describing|writing)\.\\s*\+\s*similarly/i
  ];

  return {
    id: 'armor-suffix-attack-analyzer',
    name: 'Suffix Attack Heuristic Analyzer',
    category: 'custom',
    priority: 680,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of SUFFIX_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-suffix-attack-analyzer',
            ruleName: 'Suffix Attack Heuristic Analyzer',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Adversarial suffix attack pattern detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
