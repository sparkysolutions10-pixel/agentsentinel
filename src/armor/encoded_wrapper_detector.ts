import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function decodeRot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

export function tryDecodeBase64(str: string): string | null {
  try {
    const cleaned = str.trim();
    if (cleaned.length % 4 !== 0 || !/^[A-Za-z0-9+/=]+$/.test(cleaned) || cleaned.length < 8) return null;
    const decoded = Buffer.from(cleaned, 'base64').toString('utf-8');
    // Ensure reasonable printable ASCII output
    if (/^[\x20-\x7E\s]+$/.test(decoded)) return decoded;
    return null;
  } catch {
    return null;
  }
}

export function tryDecodeHex(str: string): string | null {
  try {
    const cleaned = str.trim();
    if (cleaned.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length < 8) return null;
    const decoded = Buffer.from(cleaned, 'hex').toString('utf-8');
    if (/^[\x20-\x7E\s]+$/.test(decoded)) return decoded;
    return null;
  } catch {
    return null;
  }
}

export function createEncodedWrapperDetectorRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore all', 'bypass', 'system prompt', 'admin access', 'jailbreak'];

  return {
    id: 'armor-encoded-wrapper-detector',
    name: 'Encoded Prompt Wrapper Detector (Base64/Hex/Rot13)',
    category: 'custom',
    priority: 800,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const rawText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      // 1. Test Rot13
      const rot13 = decodeRot13(rawText).toLowerCase();
      for (const w of BLOCKED_WORDS) {
        if (rot13.includes(w) && !rawText.toLowerCase().includes(w)) {
          return {
            ruleId: 'armor-encoded-wrapper-detector',
            ruleName: 'Encoded Prompt Wrapper Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Rot13-encoded prompt injection payload detected: "${w}".`,
            detectedPattern: `rot13-${w}`
          };
        }
      }

      // 2. Scan for candidate Base64 / Hex tokens
      const tokens = rawText.split(/[^A-Za-z0-9+/=]+/);
      for (const token of tokens) {
        const b64 = tryDecodeBase64(token);
        if (b64) {
          const lower = b64.toLowerCase();
          for (const w of BLOCKED_WORDS) {
            if (lower.includes(w)) {
              return {
                ruleId: 'armor-encoded-wrapper-detector',
                ruleName: 'Encoded Prompt Wrapper Detector',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Base64-encoded prompt injection payload detected: "${w}".`,
                detectedPattern: `base64-${w}`
              };
            }
          }
        }

        const hex = tryDecodeHex(token);
        if (hex) {
          const lower = hex.toLowerCase();
          for (const w of BLOCKED_WORDS) {
            if (lower.includes(w)) {
              return {
                ruleId: 'armor-encoded-wrapper-detector',
                ruleName: 'Encoded Prompt Wrapper Detector',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Hex-encoded prompt injection payload detected: "${w}".`,
                detectedPattern: `hex-${w}`
              };
            }
          }
        }
      }

      return null;
    }
  };
}
