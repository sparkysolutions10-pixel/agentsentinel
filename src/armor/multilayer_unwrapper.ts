import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function unwrapMultiLayer(input: string, maxLayers = 5): string {
  let current = input;
  for (let i = 0; i < maxLayers; i++) {
    let unwrapped = false;
    // 1. Try URI decode
    try {
      const decodedUri = decodeURIComponent(current);
      if (decodedUri !== current) {
        current = decodedUri;
        unwrapped = true;
      }
    } catch {}

    // 2. Try Base64
    try {
      const trimmed = current.trim();
      if (trimmed.length >= 8 && trimmed.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
        const decodedB64 = Buffer.from(trimmed, 'base64').toString('utf-8');
        if (/^[\x20-\x7E\s]+$/.test(decodedB64)) {
          current = decodedB64;
          unwrapped = true;
        }
      }
    } catch {}

    if (!unwrapped) break;
  }
  return current;
}

export function createMultilayerUnwrapperRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore all', 'bypass', 'system prompt', 'jailbreak'];

  return {
    id: 'armor-multilayer-unwrapper',
    name: 'Nested Multi-Layer Encoding Unwrapper',
    category: 'custom',
    priority: 790,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }

      const candidates = [textToScan, ...textToScan.split(/[\s"'{}:,]+/)].filter(t => t.length >= 4);
      for (const cand of candidates) {
        const unwrapped = unwrapMultiLayer(cand).toLowerCase();
        for (const w of BLOCKED_WORDS) {
          if (unwrapped.includes(w) && !textToScan.toLowerCase().includes(w)) {
            return {
              ruleId: 'armor-multilayer-unwrapper',
              ruleName: 'Nested Multi-Layer Encoding Unwrapper',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Nested multi-pass encoded attack payload discovered: "${w}".`,
              detectedPattern: `multilayer-${w}`
            };
          }
        }
      }

      return null;
    }
  };
}
