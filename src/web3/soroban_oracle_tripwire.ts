/**
 * AgentSentinel - Oracle Price Deviation and Stale Feed Tripwire
 * Validates on-chain oracle timestamps against freshness thresholds (< 300s)
 * and trips when price quotes deviate > 3% from secondary benchmark feeds.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanOracleConfig {
  maxStalenessSeconds?: number; // default: 300s (5 minutes)
  maxDeviationPercent?: number; // default: 3.0%
}

export function createSorobanOracleTripwireRule(config: SorobanOracleConfig = {}): SentinelRule {
  const maxStaleness = config.maxStalenessSeconds ?? 300;
  const maxDeviation = config.maxDeviationPercent ?? 3.0;

  return {
    id: 'soroban-oracle-tripwire',
    name: 'Soroban Price Oracle Tripwire',
    category: 'custom' as ToolCategory,
    priority: 67,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('oracle') && !tool.includes('price')) {
        return null;
      }

      const params = context.params || {};
      const oracleTimestamp = Number(params.oracleTimestamp || params.updatedAt || 0);

      // 1. Check staleness
      if (oracleTimestamp > 0) {
        const nowSec = Math.floor(Date.now() / 1000);
        const staleness = nowSec - oracleTimestamp;
        if (staleness > maxStaleness) {
          return {
            ruleId: 'soroban-oracle-tripwire',
            ruleName: 'Soroban Price Oracle Tripwire',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Price oracle quote is stale (${staleness}s old, exceeds ${maxStaleness}s freshness threshold). Execution halted.`,
            detectedPattern: `STALE_ORACLE_FEED:${staleness}s>${maxStaleness}s`,
          };
        }
      }

      // 2. Check price deviation if secondary price provided
      const primaryPrice = Number(params.oraclePrice || params.price || 0);
      const secondaryPrice = Number(params.secondaryPrice || params.benchmarkPrice || 0);

      if (primaryPrice > 0 && secondaryPrice > 0) {
        const deviationPercent = (Math.abs(primaryPrice - secondaryPrice) / secondaryPrice) * 100;
        if (deviationPercent > maxDeviation) {
          return {
            ruleId: 'soroban-oracle-tripwire',
            ruleName: 'Soroban Price Oracle Tripwire',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Oracle price deviation (${deviationPercent.toFixed(2)}%) exceeds safe threshold (${maxDeviation}%). Potential oracle manipulation attempt.`,
            detectedPattern: `ORACLE_PRICE_DEVIATION:${deviationPercent.toFixed(2)}%>${maxDeviation}%`,
          };
        }
      }

      return null;
    }
  };
}
