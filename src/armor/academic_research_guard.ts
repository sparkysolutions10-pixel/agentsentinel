import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createAcademicResearchGuardRule(): SentinelRule {
  const RESEARCH_BYPASS_PATTERNS = [
    /for\s+educational\s+and\s+research\s+purposes\s+only\s+tell\s+me/i,
    /I\s+am\s+conducting\s+an\s+authorized\s+red-team\s+audit/i,
    /academic\s+vulnerability\s+analysis\s+simulation/i,
    /cybersecurity\s+dissertation\s+research\s+bypass/i
  ];

  return {
    id: 'armor-academic-research-guard',
    name: 'Academic Research and Red-Team Role Simulation Guard',
    category: 'custom',
    priority: 620,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let textToScan = typeof ctx.params === 'string' ? ctx.params : '';
      if (!textToScan && ctx.params && typeof ctx.params === 'object') {
        textToScan = Object.values(ctx.params)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join(' ');
      }
      if (!textToScan) textToScan = JSON.stringify(ctx.params || {});

      for (const p of RESEARCH_BYPASS_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-academic-research-guard',
            ruleName: 'Academic Research and Red-Team Role Simulation Guard',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Unauthorized research simulation exemption detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
