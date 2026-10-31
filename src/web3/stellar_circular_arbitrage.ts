/**
 * AgentSentinel - Circular Path Payment Arbitrage Loop Detector
 * Identifies circular conversion chains (e.g. XLM -> USDC -> EURC -> XLM)
 * and halts execution if the net expected return is negative (loss-making arbitrage).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarCircularArbitrageConfig {
  minNetProfitPercent?: number; // default: 0.1% minimum profit
}

export function createStellarCircularArbitrageDetectorRule(config: StellarCircularArbitrageConfig = {}): SentinelRule {
  const minProfit = config.minNetProfitPercent ?? 0.1;

  return {
    id: 'stellar-circular-arbitrage-detector',
    name: 'Stellar Circular Arbitrage Loop Detector',
    category: 'custom' as ToolCategory,
    priority: 84,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('arbitrage') && !tool.includes('path') && !tool.includes('swap')) {
        return null;
      }

      const params = context.params || {};
      const sourceAsset = String(params.sendAsset || params.sourceAsset || '').toUpperCase();
      const destAsset = String(params.destAsset || params.destinationAsset || '').toUpperCase();

      const isCircular = sourceAsset && destAsset && sourceAsset === destAsset;
      if (!isCircular) {
        return null;
      }

      const sendAmount = Number(params.sendAmount || params.initialCapital || 0);
      const expectedReturn = Number(params.expectedDestAmount || params.finalCapital || 0);

      if (sendAmount > 0 && expectedReturn > 0) {
        const netYieldPercent = ((expectedReturn - sendAmount) / sendAmount) * 100;
        if (netYieldPercent < minProfit) {
          return {
            ruleId: 'stellar-circular-arbitrage-detector',
            ruleName: 'Stellar Circular Arbitrage Loop Detector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Circular arbitrage yields negative or insufficient net return (${netYieldPercent.toFixed(3)}% < required ${minProfit}%). Guaranteed capital loss intercepted.`,
            detectedPattern: `NEGATIVE_YIELD_ARBITRAGE:${netYieldPercent.toFixed(3)}%<${minProfit}%`,
          };
        }
      }

      return null;
    }
  };
}
