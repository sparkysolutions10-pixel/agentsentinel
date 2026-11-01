import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createAuthorityOverrideScannerRule(): SentinelRule {
  const OVERRIDE_PATTERNS = [
    /I\s+am\s+(?:your\s+)?(?:lead\s+)?developer/i,
    /executive\s+override\s+code/i,
    /sudo\s+mode\s+activate/i,
    /developer\s+maintenance\s+(?:session|command)/i,
    /system\s+administrator\s+override/i
  ];

  return {
    id: 'armor-authority-override-scanner',
    name: 'Authority Impersonation and Executive Override Scanner',
    category: 'custom',
    priority: 630,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of OVERRIDE_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-authority-override-scanner',
            ruleName: 'Authority Impersonation and Executive Override Scanner',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `False authority override directive detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
