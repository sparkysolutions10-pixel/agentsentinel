import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const BIDI_CONTROL_REGEX = /[\u202A-\u202E\u2066-\u2069]/g;

export function createBidiSpoofingDetectorRule(): SentinelRule {
  return {
    id: 'armor-bidi-spoofing-detector',
    name: 'Bidirectional Text Override (Bidi) Spoofing Detector',
    category: 'custom',
    priority: 880,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (BIDI_CONTROL_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-bidi-spoofing-detector',
          ruleName: 'Bidirectional Text Override (Bidi) Spoofing Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Bidirectional text override characters (Bidi) detected; potential visual spoofing attempt.',
          detectedPattern: 'bidi-override-detected'
        };
      }

      return null;
    }
  };
}
