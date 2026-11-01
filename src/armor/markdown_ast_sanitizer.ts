import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMarkdownAstSanitizerRule(): SentinelRule {
  const EXFIL_IMAGE_REGEX = /!\[[^\]]*\]\((https?:\/\/[^)\s]+(?:exfil|token|track|collect|leak|log)[^)\s]*)\)/i;
  const DATA_URI_IMAGE_REGEX = /!\[[^\]]*\]\(data:image\/[^;]+;base64,[^)\s]+\)/i;
  const ZERO_PIXEL_IMAGE_REGEX = /<img[^>]+(?:width=['"]?[01]['"]?|height=['"]?[01]['"]?)[^>]*>/i;

  return {
    id: 'armor-markdown-ast-sanitizer',
    name: 'Markdown AST Link Target and Image Source Sanitizer',
    category: 'custom',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = [
        ctx.toolName,
        typeof ctx.params === 'string' ? ctx.params : JSON.stringify(ctx.params || {})
      ].join(' ');

      if (EXFIL_IMAGE_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-markdown-ast-sanitizer',
          ruleName: 'Markdown AST Link Target and Image Source Sanitizer',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Potential markdown image exfiltration attempt detected.',
          detectedPattern: 'markdown-image-exfil'
        };
      }

      if (ZERO_PIXEL_IMAGE_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-markdown-ast-sanitizer',
          ruleName: 'Markdown AST Link Target and Image Source Sanitizer',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Zero-pixel tracking pixel image tag detected in markdown output.',
          detectedPattern: 'markdown-tracking-pixel'
        };
      }

      return null;
    }
  };
}
