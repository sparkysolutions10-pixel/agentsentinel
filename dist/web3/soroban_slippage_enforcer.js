/**
 * AgentSentinel - Decentralized Exchange Maximum Slippage Enforcer
 * Enforces strict slippage tolerance (default 0.5%) on Soroban AMM swap transactions
 * to shield autonomous AI agents from MEV sandwiching and excessive price impact.
 */
import { Verdict } from '../types.js';
export function createSorobanSlippageEnforcerRule(config = {}) {
    const maxSlippage = config.maxSlippagePercent ?? 0.5;
    return {
        id: 'soroban-slippage-enforcer',
        name: 'Soroban DEX Slippage Enforcer',
        category: 'custom',
        priority: 70,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('swap') && !tool.includes('dex')) {
                return null;
            }
            const params = context.params || {};
            const expectedOut = Number(params.expectedAmountOut || params.expectedOutput || params.quotedOut || 0);
            const minOut = Number(params.minAmountOut || params.minimumReceived || params.minOut || 0);
            if (expectedOut > 0 && minOut > 0 && expectedOut > minOut) {
                const slippagePercent = ((expectedOut - minOut) / expectedOut) * 100;
                if (slippagePercent > maxSlippage) {
                    return {
                        ruleId: 'soroban-slippage-enforcer',
                        ruleName: 'Soroban DEX Slippage Enforcer',
                        severity: 'high',
                        verdict: Verdict.BLOCK,
                        reason: `Swap slippage tolerance (${slippagePercent.toFixed(2)}%) exceeds maximum allowed safety threshold (${maxSlippage}%). Potential MEV extractable value risk.`,
                        detectedPattern: `SLIPPAGE_EXCEEDED:${slippagePercent.toFixed(2)}%>${maxSlippage}%`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_slippage_enforcer.js.map