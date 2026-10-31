/**
 * AgentSentinel - Stroop Surge Multiplier Clamp
 * Clamps transaction base fees against rolling median network fees
 * to prevent runaway bidding wars during brief congestion spikes.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StroopSurgeConfig {
  maxMultiplier?: number; // default: 3.0x rolling median
  defaultMedianStroops?: number; // default: 100 stroops
}

export function createStroopSurgeMultiplierRule(config: StroopSurgeConfig = {}): SentinelRule {
  const maxMultiplier = config.maxMultiplier ?? 3.0;
  const defaultMedian = config.defaultMedianStroops ?? 100;

  return {
    id: 'stroop-surge-multiplier-clamp',
    name: 'Stroop Surge Multiplier Clamp',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('tx') && !tool.includes('stellar') && !tool.includes('soroban') && !tool.includes('fee')) {
        return null;
      }

      const params = context.params || {};
      const fee = Number(params.baseFee ?? params.fee ?? 0);
      const medianFee = Number(params.rollingMedianFee ?? params.medianFee ?? defaultMedian);

      if (fee <= 0) {
        return null;
      }

      const allowedMax = medianFee * maxMultiplier;
      if (fee > allowedMax) {
        return {
          ruleId: 'stroop-surge-multiplier-clamp',
          ruleName: 'Stroop Surge Multiplier Clamp',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Transaction fee (${fee} stroops) exceeds surge ceiling (${allowedMax} stroops, ${maxMultiplier}x median ${medianFee}). Congestion surge clamp engaged.`,
          detectedPattern: `SURGE_MULTIPLIER_EXCEEDED:${fee}>${allowedMax}`
        };
      }

      return null;
    }
  };
}
