/**
 * AgentSentinel - Liquidity Pool Reserves Drain Limit Clamp
 * Clamps maximum liquidity extraction per transaction (< 10% default)
 * to prevent sudden drain attacks, bank runs, and protocol insolvency.
 */
import { Verdict } from '../types.js';
export function createSorobanPoolDrainClampRule(config = {}) {
    const maxDrain = config.maxDrainPercent ?? 10.0;
    return {
        id: 'soroban-pool-drain-clamp',
        name: 'Soroban Pool Drain Clamp',
        category: 'custom',
        priority: 66,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('pool') && !tool.includes('withdraw') && !tool.includes('swap')) {
                return null;
            }
            const params = context.params || {};
            const withdrawAmount = Number(params.withdrawAmount || params.amount || params.outAmount || 0);
            const totalReserves = Number(params.poolReserves || params.totalLiquidity || 0);
            if (withdrawAmount > 0 && totalReserves > 0) {
                const drainPercent = (withdrawAmount / totalReserves) * 100;
                if (drainPercent > maxDrain) {
                    return {
                        ruleId: 'soroban-pool-drain-clamp',
                        ruleName: 'Soroban Pool Drain Clamp',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `Excessive liquidity extraction: transaction attempts to withdraw ${drainPercent.toFixed(1)}% of total pool reserves, exceeding ${maxDrain}% safety clamp limit.`,
                        detectedPattern: `POOL_DRAIN_LIMIT_EXCEEDED:${drainPercent.toFixed(2)}%>${maxDrain}%`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_pool_drain_clamp.js.map