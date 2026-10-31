/**
 * AgentSentinel - FATF Travel Rule IVMS 101 Payload Inspector
 * Enforces transmission of originator/beneficiary compliance metadata
 * on transactions exceeding regulatory thresholds.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface TravelRuleConfig {
  thresholdAmount?: number; // default: 1,000 USD/units
}

export function createTravelRuleInspector(config: TravelRuleConfig = {}): SentinelRule {
  const threshold = config.thresholdAmount ?? 1000;

  return {
    id: 'travel-rule-inspector',
    name: 'FATF Travel Rule Inspector',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('transfer') && !tool.includes('pay') && !tool.includes('send')) {
        return null;
      }

      const params = context.params || {};
      const amount = Number(params.amount ?? params.value ?? 0);

      if (amount >= threshold) {
        const metadata = params.travelRule || params.ivms101 || params.complianceData;
        if (!metadata) {
          return {
            ruleId: 'travel-rule-inspector',
            ruleName: 'FATF Travel Rule Inspector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Transfer amount (${amount.toLocaleString()}) meets/exceeds Travel Rule regulatory threshold (${threshold.toLocaleString()}). IVMS 101 originator and beneficiary metadata missing.`,
            detectedPattern: `TRAVEL_RULE_METADATA_MISSING:${amount}>=${threshold}`
          };
        }
      }

      return null;
    }
  };
}
