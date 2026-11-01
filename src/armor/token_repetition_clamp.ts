import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createTokenRepetitionClampRule(maxIdenticalRatio = 0.6): SentinelRule {
  return {
    id: 'armor-token-repetition-clamp',
    name: 'Prompt Token Repetition and Denial-of-Service Clamp',
    category: 'custom',
    priority: 530,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      if (textToScan.length < 50) return null;

      const words = textToScan.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      if (words.length < 15) return null;

      const freq = new Map<string, number>();
      let maxCount = 0;
      let topWord = '';

      for (const w of words) {
        const count = (freq.get(w) || 0) + 1;
        freq.set(w, count);
        if (count > maxCount) {
          maxCount = count;
          topWord = w;
        }
      }

      const ratio = maxCount / words.length;
      if (ratio >= maxIdenticalRatio) {
        return {
          ruleId: 'armor-token-repetition-clamp',
          ruleName: 'Prompt Token Repetition and Denial-of-Service Clamp',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Repeated token denial-of-service clamp triggered: "${topWord}" comprises ${(ratio * 100).toFixed(1)}% of total prompt words.`,
          detectedPattern: `token-repetition-ratio-${ratio.toFixed(2)}`
        };
      }

      return null;
    }
  };
}
