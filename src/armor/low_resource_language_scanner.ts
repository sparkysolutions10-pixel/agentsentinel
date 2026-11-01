import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createLowResourceLanguageScannerRule(): SentinelRule {
  const LOW_RESOURCE_ATTACK_PATTERNS = [
    // Zulu: dlula imithetho (bypass rules)
    /dlula\s+imithetho/i,
    // Scots Gaelic: seachain na riaghailtean (bypass rules)
    /seachain\s+na\s+riaghailtean/i,
    // Javanese: ngliwati aturan (bypass rules)
    /ngliwati\s+aturan/i,
    // Welsh: anwybyddu rheolau (ignore rules)
    /anwybyddu\s+rheolau/i
  ];

  return {
    id: 'armor-low-resource-language',
    name: 'Low-Resource Language Injection Heuristic Scanner',
    category: 'custom',
    priority: 600,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of LOW_RESOURCE_ATTACK_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-low-resource-language',
            ruleName: 'Low-Resource Language Injection Heuristic Scanner',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Cross-lingual low-resource language exploit directive detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
