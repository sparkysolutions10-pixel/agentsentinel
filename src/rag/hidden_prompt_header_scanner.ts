import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createHiddenPromptHeaderScannerRule(): SentinelRule {
  return {
    id: 'rag-hidden-prompt-header-scanner',
    name: 'Scan Markdown Headers for Hidden Prompt Injection',
    category: 'custom',
    priority: 960,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const text = String(ctx.params?.content || ctx.params?.markdown || ctx.params?.chunk || '');
      const zeroWidthPattern = /[\u200B-\u200D\uFEFF]/;
      if (zeroWidthPattern.test(text)) {
        return {
          ruleId: 'rag-hidden-prompt-header-scanner',
          ruleName: 'Scan Markdown Headers for Hidden Prompt Injection',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Document contains hidden zero-width unicode characters indicative of prompt injection.',
          detectedPattern: 'zero-width-unicode-injection',
        };
      }
      const lower = text.toLowerCase();
      if (lower.includes('<!--') && (lower.includes('ignore previous instructions') || lower.includes('system prompt'))) {
        return {
          ruleId: 'rag-hidden-prompt-header-scanner',
          ruleName: 'Scan Markdown Headers for Hidden Prompt Injection',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Document contains hidden HTML comment attempting prompt injection override.',
          detectedPattern: 'hidden-comment-prompt-override',
        };
      }
      return null;
    }
  };
}
