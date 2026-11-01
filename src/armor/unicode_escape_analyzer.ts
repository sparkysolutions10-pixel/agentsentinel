import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function decodeUnicodeEscapes(str: string): string {
  return str
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function createUnicodeEscapeAnalyzerRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'system prompt', 'admin', 'jailbreak'];

  return {
    id: 'armor-unicode-escape-analyzer',
    name: 'Unicode Escape Sequence Decoding Analyzer',
    category: 'custom',
    priority: 780,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }

      if (!/\\[ux][0-9a-fA-F]/i.test(textToScan)) {
        return null;
      }

      const decoded = decodeUnicodeEscapes(textToScan).toLowerCase();

      for (const w of BLOCKED_WORDS) {
        if (decoded.includes(w) && !textToScan.toLowerCase().includes(w)) {
          return {
            ruleId: 'armor-unicode-escape-analyzer',
            ruleName: 'Unicode Escape Sequence Decoding Analyzer',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Unicode/Hex escaped injection directive detected: "${w}".`,
            detectedPattern: `escape-${w}`
          };
        }
      }

      return null;
    }
  };
}
