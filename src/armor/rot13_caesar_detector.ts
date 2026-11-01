import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { decodeRot13 } from './encoded_wrapper_detector.js';

export function createRot13CaesarDetectorRule(): SentinelRule {
  const BLOCKED_WORDS = ['ignore all', 'system prompt', 'jailbreak', 'bypass', 'admin'];

  return {
    id: 'armor-rot13-caesar-detector',
    name: 'ROT13 and Caesar Cipher Text Obfuscation Detector',
    category: 'custom',
    priority: 670,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      const decoded = decodeRot13(textToScan).toLowerCase();
      for (const w of BLOCKED_WORDS) {
        if (decoded.includes(w) && !textToScan.toLowerCase().includes(w)) {
          return {
            ruleId: 'armor-rot13-caesar-detector',
            ruleName: 'ROT13 and Caesar Cipher Text Obfuscation Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `ROT13/Caesar cipher obfuscated injection keyword detected: "${w}".`,
            detectedPattern: `rot13-${w}`
          };
        }
      }

      return null;
    }
  };
}
