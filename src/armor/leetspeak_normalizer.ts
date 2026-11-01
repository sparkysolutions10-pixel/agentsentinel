import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function normalizeLeetspeak(text: string): string {
  return text
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[8]/g, 'b');
}

export function createLeetspeakNormalizerRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'pwned', 'system', 'admin', 'root', 'jailbreak'];

  return {
    id: 'armor-leetspeak-normalizer',
    name: 'Leetspeak and Phonetic Character Substitution Normalizer',
    category: 'custom',
    priority: 870,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const rawText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      const normalized = normalizeLeetspeak(rawText).toLowerCase();

      for (const word of BLOCKED_WORDS) {
        if (normalized.includes(word) && !rawText.toLowerCase().includes(word)) {
          return {
            ruleId: 'armor-leetspeak-normalizer',
            ruleName: 'Leetspeak and Phonetic Character Substitution Normalizer',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Leetspeak obfuscated prompt keyword detected: "${word}".`,
            detectedPattern: `leetspeak-${word}`
          };
        }
      }

      return null;
    }
  };
}
