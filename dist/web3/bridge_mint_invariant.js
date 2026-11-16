/**
 * AgentSentinel - Bridge Mint Reserve Invariant Checker
 * Enforces the strict invariant that cross-chain minted wrapped tokens
 * must never exceed verified locked reserves on the underlying native chain.
 */
import { Verdict } from '../types.js';
export function createBridgeMintInvariantRule(config = {}) {
    const maxRatio = config.maxMintRatio ?? 1.0;
    return {
        id: 'bridge-mint-invariant-checker',
        name: 'Bridge Mint Reserve Invariant Checker',
        category: 'custom',
        priority: 85,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('mint') && !tool.includes('bridge') && !tool.includes('wrap')) {
                return null;
            }
            const params = context.params || {};
            const mintAmount = Number(params.mintAmount ?? params.amount ?? params.value ?? 0);
            const lockedReserve = Number(params.lockedReserve ?? params.collateralReserve ?? config.staticLockedReserve ?? 0);
            if (mintAmount <= 0) {
                return null;
            }
            if (lockedReserve <= 0) {
                return {
                    ruleId: 'bridge-mint-invariant-checker',
                    ruleName: 'Bridge Mint Reserve Invariant Checker',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Bridge mint blocked: zero verified locked reserve available (${lockedReserve}). Potential unbacked counterfeit mint intercepted.`,
                    detectedPattern: `ZERO_LOCKED_RESERVE:${mintAmount}>0`
                };
            }
            const allowedMint = lockedReserve * maxRatio;
            if (mintAmount > allowedMint) {
                return {
                    ruleId: 'bridge-mint-invariant-checker',
                    ruleName: 'Bridge Mint Reserve Invariant Checker',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Bridge mint blocked: requested mint amount (${mintAmount.toLocaleString()}) exceeds maximum permitted collateralized limit (${allowedMint.toLocaleString()}). Invariant broken.`,
                    detectedPattern: `RESERVE_INVARIANT_VIOLATION:${mintAmount}>${allowedMint}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=bridge_mint_invariant.js.map