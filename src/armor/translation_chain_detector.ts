import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createTranslationChainDetectorRule(): SentinelRule {
  const TRANSLATE_CHAIN_REGEX = /translate\s+(?:this|the\s+following|the\s+text)\s+(?:to|into)\s+[a-zA-Z]+\s*(?:,|and|then)?\s+(?:and\s+then\s+|then\s+)?(?:execute|follow|run|perform)\s+(?:the\s+)?(?:instructions|directives|commands)/i;

  return {
    id: 'armor-translation-chain',
    name: 'Multi-Step Translation Chain Evasion Detector',
    category: 'custom',
    priority: 590,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (TRANSLATE_CHAIN_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-translation-chain',
          ruleName: 'Multi-Step Translation Chain Evasion Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Translate-and-execute multi-stage evasion directive detected.',
          detectedPattern: 'translate-and-execute-chain'
        };
      }

      return null;
    }
  };
}
