import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const INVISIBLE_UNICODE_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD]/g;

export function stripInvisibleUnicode(text: string): string {
  return text.replace(INVISIBLE_UNICODE_REGEX, '');
}

export function createInvisibleUnicodeStripperRule(): SentinelRule {
  const BLOCKED_WORDS = [
    'ignore', 'system', 'admin', 'bypass', 'jailbreak',
    'rm', 'rf', 'drop', 'table', 'truncate', 'delete',
    'curl', 'wget', 'cat', 'mkfs', 'dd', 'powershell',
    'bash', 'eval', 'exec', 'chmod', 'chown', 'shadow', 'passwd'
  ];

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
      const isExecContext = ctx.category === 'shell' || ctx.category === 'sql' || ctx.category === 'fs' ||
        /(?:bash|sh|exec|eval|cmd|powershell|sql|query|system)/i.test(ctx.toolName);

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

      if (isExecContext) {
        return {
          ruleId: 'armor-invisible-unicode-stripper',
          ruleName: 'Zero-Width Character and Invisible Unicode Stripper',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Zero-width invisible characters detected inside executable command payload.',
          detectedPattern: 'zero-width-in-executable'
        };
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
