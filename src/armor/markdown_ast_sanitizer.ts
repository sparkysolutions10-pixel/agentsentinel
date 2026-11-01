import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMarkdownAstSanitizerRule(): SentinelRule {
  const EXFIL_IMAGE_REGEX = /!\[[^\]]*\]\((https?:\/\/[^)\s]+(?:exfil|token|track|collect|leak|log)[^)\s]*)\)/i;
  const ZERO_PIXEL_IMAGE_REGEX = /<img[^>]+(?:width|height)[\s=\\"']*0/i;

  return {
    id: 'armor-markdown-ast-sanitizer',
    name: 'Markdown AST Link Target and Image Source Sanitizer',
    category: 'custom',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = ctx.toolName;
      if (typeof ctx.params === 'string') {
        textToScan += ' ' + ctx.params;
      } else if (ctx.params && typeof ctx.params === 'object') {
        textToScan += ' ' + Object.values(ctx.params).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' ') + ' ' + JSON.stringify(ctx.params);
      }

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
