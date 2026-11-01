import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createAstPromptTokenizerRule(): SentinelRule {
  const DELIMITER_PATTERNS = [
    /<\/?system>/i,
    /\[\/?inst\]/i,
    /<<\/?sys>>/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /```\s*(?:system|instruction|prompt)/i,
    /(?:^|\n)(?:system|assistant|instruction):\s*\n/i
  ];

  return {
    id: 'armor-ast-prompt-tokenizer',
    name: 'AST Prompt Tokenizer and Delimiter Boundary Detector',
    category: 'custom',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = [
        ctx.toolName,
        typeof ctx.params === 'string' ? ctx.params : JSON.stringify(ctx.params || {})
      ].join(' ');

      for (const pattern of DELIMITER_PATTERNS) {
        if (pattern.test(textToScan)) {
          return {
            ruleId: 'armor-ast-prompt-tokenizer',
            ruleName: 'AST Prompt Tokenizer and Delimiter Boundary Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Injected prompt delimiter boundary tag detected matching ${pattern.source}`,
            detectedPattern: pattern.source
          };
        }
      }

      return null;
    }
  };
}
