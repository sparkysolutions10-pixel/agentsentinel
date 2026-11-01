import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createScriptDialogueFilterRule(): SentinelRule {
  const DIALOGUE_BYPASS_PATTERNS = [
    /(?:Character\s+[AB]|User\s+[12]|Alice|Bob):\s*(?:ignore|bypass|drop\s+guardrails)/i,
    /write\s+a\s+dialogue\s+between\s+two\s+hackers\s+explaining\s+how\s+to/i,
    /script\s+dialogue:\s*\n*(?:Hacker|Attacker):/i
  ];

  return {
    id: 'armor-script-dialogue-filter',
    name: 'Multi-Character Script Dialogue Injection Filter',
    category: 'custom',
    priority: 610,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of DIALOGUE_BYPASS_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-script-dialogue-filter',
            ruleName: 'Multi-Character Script Dialogue Injection Filter',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Malicious script dialogue pattern detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
