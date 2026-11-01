import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createEvilTwinDetectorRule(): SentinelRule {
  const EVIL_TWIN_PATTERNS = [
    /you\s+have\s+an\s+evil\s+twin/i,
    /act\s+as\s+(?:the\s+)?opposite\s+of\s+(?:assistant|chatgpt|claude|gemini)/i,
    /your\s+alter\s+ego\s+(?:has\s+no\s+morals|does\s+not\s+obey)/i,
    /anti-assistant\s+mode/i,
    /unconstrained\s+evil\s+persona/i
  ];

  return {
    id: 'armor-evil-twin-detector',
    name: 'Evil Twin / Inverted Persona Instruction Detector',
    category: 'custom',
    priority: 720,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of EVIL_TWIN_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-evil-twin-detector',
            ruleName: 'Evil Twin / Inverted Persona Instruction Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Evil twin / inverted persona jailbreak directive detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
