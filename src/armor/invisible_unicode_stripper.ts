import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const INVISIBLE_UNICODE_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD]/g;

export function stripInvisibleUnicode(text: string): string {
  return text.replace(INVISIBLE_UNICODE_REGEX, '');
}

export function createInvisibleUnicodeStripperRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'system', 'admin', 'bypass', 'jailbreak'];

  return {
    id: 'armor-invisible-unicode-stripper',
    name: 'Zero-Width Character and Invisible Unicode Stripper',
    category: 'custom',
    priority: 890,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const rawText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (!INVISIBLE_UNICODE_REGEX.test(rawText)) {
        return null;
      }

      const stripped = stripInvisibleUnicode(rawText).toLowerCase();

      for (const word of BLOCKED_WORDS) {
        if (stripped.includes(word) && !rawText.toLowerCase().includes(word)) {
          return {
            ruleId: 'armor-invisible-unicode-stripper',
            ruleName: 'Zero-Width Character and Invisible Unicode Stripper',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Zero-width invisible characters hidden attack keyword detected: "${word}".`,
            detectedPattern: `invisible-char-${word}`
          };
        }
      }

      return {
        ruleId: 'armor-invisible-unicode-stripper',
        ruleName: 'Zero-Width Character and Invisible Unicode Stripper',
        severity: 'low',
        verdict: Verdict.CONFIRM,
        reason: 'Invisible zero-width unicode characters detected in input prompt.',
        detectedPattern: 'zero-width-detected'
      };
    }
  };
}
