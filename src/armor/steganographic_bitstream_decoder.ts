import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function decodeZeroWidthBitstream(text: string): string | null {
  const bits: string[] = [];
  for (const char of text) {
    if (char === '\u200B') bits.push('0');
    else if (char === '\u200C') bits.push('1');
  }

  if (bits.length < 8) return null;
  const bitString = bits.join('');
  let result = '';
  for (let i = 0; i + 8 <= bitString.length; i += 8) {
    const byte = bitString.slice(i, i + 8);
    const code = parseInt(byte, 2);
    if (code >= 32 && code <= 126) {
      result += String.fromCharCode(code);
    }
  }

  return result.length > 0 ? result : null;
}

export function createSteganographicBitstreamDecoderRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'admin', 'root', 'jailbreak'];

  return {
    id: 'armor-steganographic-bitstream',
    name: 'Steganographic Zero-Width Binary Bitstream Decoder',
    category: 'custom',
    priority: 760,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }

      const decoded = decodeZeroWidthBitstream(textToScan);
      if (!decoded) return null;

      const lower = decoded.toLowerCase();
      for (const w of BLOCKED_WORDS) {
        if (lower.includes(w)) {
          return {
            ruleId: 'armor-steganographic-bitstream',
            ruleName: 'Steganographic Zero-Width Binary Bitstream Decoder',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Steganographically hidden binary bitstream attack directive detected: "${w}".`,
            detectedPattern: `steganography-${w}`
          };
        }
      }

      return null;
    }
  };
}
