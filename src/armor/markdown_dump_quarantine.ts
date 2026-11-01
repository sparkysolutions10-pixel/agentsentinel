import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMarkdownDumpQuarantineRule(): SentinelRule {
  const DUMP_FENCE_REGEX = /```(?:markdown|text|system)?[\s\S]*?(?:#+\s*System\s+Instructions|You\s+are\s+a\s+large\s+language\s+model|Internal\s+Policy\s+Guidelines)[\s\S]*?```/i;

  return {
    id: 'armor-markdown-dump-quarantine',
    name: 'Markdown Code Block System Dump Quarantine',
    category: 'custom',
    priority: 810,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join('\n');
      }

      if (DUMP_FENCE_REGEX.test(textToScan)) {
        return {
          ruleId: 'armor-markdown-dump-quarantine',
          ruleName: 'Markdown Code Block System Dump Quarantine',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Raw markdown code block system prompt dump detected.',
          detectedPattern: 'codeblock-system-dump'
        };
      }

      return null;
    }
  };
}
