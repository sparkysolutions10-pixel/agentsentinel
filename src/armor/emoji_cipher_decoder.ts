import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const EMOJI_REBUS_MAP: Record<string, string> = {
  '💣': 'bomb',
  '💥': 'exploit',
  '🔓': 'bypass',
  '💉': 'inject',
  '💀': 'kill',
  '🔑': 'password'
};

export function decodeEmojiRebus(text: string): string {
  let out = text;
  for (const [emoji, word] of Object.entries(EMOJI_REBUS_MAP)) {
    out = out.split(emoji).join(` ${word} `);
  }
  return out;
}

export function createEmojiCipherDecoderRule(): SentinelRule {
  const BLOCKED_COMBINATIONS = [
    /bypass\s+rules/i,
    /inject\s+code/i,
    /exploit\s+vulnerability/i,
    /password\s+leak/i
  ];

  return {
    id: 'armor-emoji-cipher-decoder',
    name: 'Emoji and Rebus Pictorial Prompt Cipher Decoder',
    category: 'custom',
    priority: 570,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let rawText = typeof ctx.params === 'string' ? ctx.params : '';
      if (!rawText && ctx.params && typeof ctx.params === 'object') {
        rawText = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!rawText) rawText = JSON.stringify(ctx.params || {});

      const decoded = decodeEmojiRebus(rawText);

      for (const p of BLOCKED_COMBINATIONS) {
        if (p.test(decoded) && !p.test(rawText)) {
          return {
            ruleId: 'armor-emoji-cipher-decoder',
            ruleName: 'Emoji and Rebus Pictorial Prompt Cipher Decoder',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Emoji cipher rebus injection attack detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
