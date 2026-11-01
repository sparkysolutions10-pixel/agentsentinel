import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDeveloperModeDetectorRule(): SentinelRule {
  const DEV_MODE_PATTERNS = [
    /developer\s+mode\s+(?:is\s+now\s+active|enabled|unlocked)/i,
    /simulate\s+developer\s+mode/i,
    /ignore\s+content\s+filters?\s+(?:in|for)\s+debug\s+mode/i,
    /debug\s+environment\s+with\s+all\s+safety\s+disabled/i,
    /test\s+mode:\s*disable\s+firewall/i
  ];

  return {
    id: 'armor-developer-mode-detector',
    name: 'Developer Mode Debug Backdoor Simulation Detector',
    category: 'custom',
    priority: 710,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of DEV_MODE_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-developer-mode-detector',
            ruleName: 'Developer Mode Debug Backdoor Simulation Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Developer mode simulation bypass detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
