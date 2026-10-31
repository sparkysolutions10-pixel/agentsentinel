/**
 * AgentSentinel - Mempool Sandwich Attack and Front-Running Detector
 * Detects sudden gas/fee spikes and hostile liquidity shifts preceding
 * transaction broadcast to shield agents from predatory sandwiching.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanSandwichConfig {
  feeSpikeRatioThreshold?: number; // default: 3.0x
}

export function createSorobanSandwichDetectorRule(config: SorobanSandwichConfig = {}): SentinelRule {
  const spikeThreshold = config.feeSpikeRatioThreshold ?? 3.0;

  return {
    id: 'soroban-sandwich-detector',
    name: 'Soroban Mempool Sandwich Detector',
    category: 'custom' as ToolCategory,
    priority: 69,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('swap') && !tool.includes('pool')) {
        return null;
      }

      const params = context.params || {};
      const baseFee = Number(params.networkBaseFee || 100);
      const currentSurgeFee = Number(params.currentMempoolFee || baseFee);
      const feeRatio = currentSurgeFee / Math.max(1, baseFee);

      if (params.suspiciousPrecedingTxDetected === true || feeRatio > spikeThreshold) {
        return {
          ruleId: 'soroban-sandwich-detector',
          ruleName: 'Soroban Mempool Sandwich Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Predatory MEV sandwich attack condition detected: mempool fee spiked by ${feeRatio.toFixed(1)}x above baseline with preceding hostile transaction.`,
          detectedPattern: `SANDWICH_MEV_SURGE:${feeRatio.toFixed(2)}x>${spikeThreshold}x`,
        };
      }

      return null;
    }
  };
}
