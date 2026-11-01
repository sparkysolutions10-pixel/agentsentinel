import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { calculateShannonEntropy } from '../secrets/index.js';

export function createTokenEntropyRule(entropyThreshold = 4.8): SentinelRule {
  return {
    id: 'armor-token-entropy-rule',
    name: 'Token Entropy Calculation Rule for Prompt Payload Analysis',
    category: 'custom',
    priority: 910,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      const words = textToScan.split(/[^a-zA-Z0-9+/=_-]+/);
      for (const word of words) {
        if (word.length >= 40) {
          const entropy = calculateShannonEntropy(word);
          if (entropy >= entropyThreshold) {
            return {
              ruleId: 'armor-token-entropy-rule',
              ruleName: 'Token Entropy Calculation Rule for Prompt Payload Analysis',
              severity: 'medium',
              verdict: Verdict.BLOCK,
              reason: `High entropy token detected (${entropy.toFixed(2)} bits/char >= ${entropyThreshold}): potential encrypted/obfuscated payload.`,
              detectedPattern: `entropy-${entropy.toFixed(2)}`
            };
          }
        }
      }

      return null;
    }
  };
}
