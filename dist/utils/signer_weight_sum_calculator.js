/**
 * SignerWeightSumCalculator - Multisig quorum and threshold evaluation.
 */
export class SignerWeightSumCalculator {
    static calculateTotalWeight(signers, masterWeight = 1) {
        let sum = Math.max(0, masterWeight);
        for (const s of signers) {
            if (s.weight > 0) {
                sum += s.weight;
            }
        }
        return sum;
    }
    static evaluateQuorum(signers, thresholds, masterWeight = 1) {
        const totalWeight = this.calculateTotalWeight(signers, masterWeight);
        const canSatisfyLow = totalWeight >= thresholds.lowThreshold;
        const canSatisfyMed = totalWeight >= thresholds.medThreshold;
        const canSatisfyHigh = totalWeight >= thresholds.highThreshold;
        const isLocked = !canSatisfyMed || !canSatisfyHigh;
        return {
            totalWeight,
            canSatisfyLow,
            canSatisfyMed,
            canSatisfyHigh,
            isLocked
        };
    }
    static isSignatureSubsetSufficient(participatingKeys, allSigners, requiredThreshold, masterKey, masterWeight = 1) {
        let sum = 0;
        const keySet = new Set(participatingKeys);
        if (masterKey && keySet.has(masterKey)) {
            sum += Math.max(0, masterWeight);
        }
        for (const s of allSigners) {
            if (keySet.has(s.key)) {
                sum += s.weight;
            }
        }
        return sum >= requiredThreshold;
    }
}
//# sourceMappingURL=signer_weight_sum_calculator.js.map