import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const HOMOGLYPH_MAP: Record<string, string> = {
  '\u0430': 'a', '\u0410': 'A',
  '\u0435': 'e', '\u0415': 'E',
  '\u043E': 'o', '\u041E': 'O',
  '\u0440': 'p', '\u0420': 'P',
  '\u0441': 'c', '\u0421': 'C',
  '\u0443': 'y', '\u0423': 'Y',
  '\u0445': 'x', '\u0425': 'X',
  '\u0456': 'i', '\u0406': 'I',
  '\u0458': 'j', '\u0408': 'J',
  '\u03B1': 'a', '\u0391': 'A',
  '\u03B2': 'b', '\u0392': 'B',
  '\u03B5': 'e', '\u0395': 'E',
  '\u03BF': 'o', '\u039F': 'O',
  '\u03C1': 'p', '\u03A1': 'P'
};

export function canonicalizeHomoglyphs(text: string): string {
  let result = '';
  for (const char of text) {
    result += HOMOGLYPH_MAP[char] || char;
  }
  return result;
}

export function createHomoglyphCanonicalizerRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'admin', 'system', 'jailbreak', 'password', 'root'];

  return {
    id: 'armor-homoglyph-canonicalizer',
    name: 'Cyrillic and Greek Homoglyph Canonicalization Rule',
    category: 'custom',
    priority: 900,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const rawText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      const normalized = canonicalizeHomoglyphs(rawText).toLowerCase();

      for (const word of BLOCKED_WORDS) {
        if (normalized.includes(word) && !rawText.toLowerCase().includes(word)) {
          return {
            ruleId: 'armor-homoglyph-canonicalizer',
            ruleName: 'Cyrillic and Greek Homoglyph Canonicalization Rule',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Homoglyph obfuscated attack keyword detected: normalized "${word}" found in payload.`,
            detectedPattern: `homoglyph-${word}`
          };
        }
      }

      return null;
    }
  };
}
