/**
 * AgentSentinel - Multi-Signature Threshold and Weight Verification Rule
 * Verifies that the aggregate weight of attached signatures satisfies
 * account threshold requirements before dispatching multi-sig transactions.
 */
import { Verdict } from '../types.js';
export function createStellarMultisigVerifierRule(config = {}) {
    const defaultLevel = config.requiredThresholdLevel ?? 'medium';
    return {
        id: 'stellar-multisig-verifier',
        name: 'Stellar Multi-Sig Threshold Verifier',
        category: 'custom',
        priority: 78,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('multisig')) {
                return null;
            }
            const params = context.params || {};
            const thresholds = params.thresholds || {};
            const targetLevel = params.operationThreshold || defaultLevel;
            const requiredWeight = Number(thresholds[targetLevel] || params.requiredWeight || 0);
            const signers = Array.isArray(params.signers) ? params.signers : [];
            if (signers.length > 0 && requiredWeight > 0) {
                const totalWeight = signers.reduce((acc, s) => acc + Number(s.weight || 0), 0);
                if (totalWeight < requiredWeight) {
                    return {
                        ruleId: 'stellar-multisig-verifier',
                        ruleName: 'Stellar Multi-Sig Threshold Verifier',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `Multi-signature weight deficit: attached signers total weight (${totalWeight}) is below required "${targetLevel}" threshold (${requiredWeight}).`,
                        detectedPattern: `MULTISIG_WEIGHT_DEFICIT:${totalWeight}<${requiredWeight}`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=stellar_multisig_verifier.js.map