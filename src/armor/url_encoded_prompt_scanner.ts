import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createUrlEncodedPromptScannerRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore', 'bypass', 'admin', 'system prompt', 'jailbreak'];

  return {
    id: 'armor-url-encoded-prompt-scanner',
    name: 'URL-Encoded Payload Scanner in Prompt Body',
    category: 'custom',
    priority: 770,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }

      if (!/%[0-9a-fA-F]{2}/.test(textToScan)) {
        return null;
      }

      let decoded = '';
      try {
        decoded = decodeURIComponent(textToScan).toLowerCase();
      } catch {
        return null;
      }

      for (const w of BLOCKED_WORDS) {
        if (decoded.includes(w) && !textToScan.toLowerCase().includes(w)) {
          return {
            ruleId: 'armor-url-encoded-prompt-scanner',
            ruleName: 'URL-Encoded Payload Scanner in Prompt Body',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `URL percent-encoded attack instruction detected: "${w}".`,
            detectedPattern: `url-encoded-${w}`
          };
        }
      }

      return null;
    }
  };
}
