import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function foldMathSymbols(text: string): string {
  // Use NFKD compatibility decomposition to fold mathematical stylized letters to ASCII
  return text.normalize('NFKD');
}

export function createMathSymbolsFolderRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'system', 'admin', 'jailbreak', 'prompt'];

  return {
    id: 'armor-math-symbols-folder',
    name: 'Mathematical Alphanumeric Symbols Fold Rule',
    category: 'custom',
    priority: 860,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const rawText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      const folded = foldMathSymbols(rawText).toLowerCase();

      for (const word of BLOCKED_WORDS) {
        if (folded.includes(word) && !rawText.toLowerCase().includes(word)) {
          return {
            ruleId: 'armor-math-symbols-folder',
            ruleName: 'Mathematical Alphanumeric Symbols Fold Rule',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Stylized mathematical unicode font attack detected: resolved "${word}".`,
            detectedPattern: `math-font-${word}`
          };
        }
      }

      return null;
    }
  };
}
