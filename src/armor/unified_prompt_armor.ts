import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { createAstPromptTokenizerRule } from './ast_prompt_tokenizer.js';
import { createHomoglyphCanonicalizerRule } from './homoglyph_canonicalizer.js';
import { createDanJailbreakMatcherRule } from './dan_jailbreak_matcher.js';
import { createEncodedWrapperDetectorRule } from './encoded_wrapper_detector.js';

export function createUnifiedPromptArmorRule(): SentinelRule {
  const subRules = [
    createAstPromptTokenizerRule(),
    createHomoglyphCanonicalizerRule(),
    createDanJailbreakMatcherRule(),
    createEncodedWrapperDetectorRule()
  ];

  return {
    id: 'armor-unified-prompt-armor',
    name: 'Unified PromptArmor Security Coordinator',
    category: 'custom',
    priority: 1000,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      for (const rule of subRules) {
        const res = rule.evaluate(ctx);
        if (res && !(res instanceof Promise)) {
          if (res.verdict === Verdict.BLOCK) {
            return {
              ruleId: 'armor-unified-prompt-armor',
              ruleName: 'Unified PromptArmor Security Coordinator',
              severity: res.severity || 'critical',
              verdict: Verdict.BLOCK,
              reason: `[PromptArmor Block] Sub-rule "${rule.name}" triggered: ${res.reason}`,
              detectedPattern: res.detectedPattern || 'prompt-armor-violation'
            };
          }
        }
      }

      return null;
    }
  };
}
