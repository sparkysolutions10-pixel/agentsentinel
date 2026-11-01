import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMultilingualExtractionGuardRule(): SentinelRule {
  const MULTILINGUAL_PATTERNS = [
    // French: répétez les instructions
    /r[eé]p[eé]t(?:ez|er)\s+(?:les\s+)?instructions/i,
    // Spanish: repite las instrucciones
    /repite\s+(?:las\s+)?instrucciones/i,
    // German: wiederhole die anweisungen
    /wiederhol(?:e|en)\s+(?:die\s+)?(?:anweisungen|instruktionen)/i,
    // Chinese: 重复之前的指令
    /[\u91CD\u590D].{0,5}[\u6307\u4EE4\u89C4\u5219\u63D0\u793A]/,
    // Russian: повторите инструкции
    /повторит[еь]\s+(?:предыдущие\s+)?инструкции/i
  ];

  return {
    id: 'armor-multilingual-extraction',
    name: 'Multi-Lingual System Prompt Extraction Guard',
    category: 'custom',
    priority: 820,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const pattern of MULTILINGUAL_PATTERNS) {
        if (pattern.test(textToScan)) {
          return {
            ruleId: 'armor-multilingual-extraction',
            ruleName: 'Multi-Lingual System Prompt Extraction Guard',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Multi-lingual system prompt extraction directive detected.',
            detectedPattern: pattern.source
          };
        }
      }

      return null;
    }
  };
}
