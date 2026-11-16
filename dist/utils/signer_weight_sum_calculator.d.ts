/**
 * SignerWeightSumCalculator - Multisig quorum and threshold evaluation.
 */
export interface AccountThresholds {
    lowThreshold: number;
    medThreshold: number;
    highThreshold: number;
}
export interface SignerEntry {
    key: string;
    weight: number;
}
export interface ThresholdEvaluation {
    totalWeight: number;
    canSatisfyLow: boolean;
    canSatisfyMed: boolean;
    canSatisfyHigh: boolean;
    isLocked: boolean;
}
export declare class SignerWeightSumCalculator {
    static calculateTotalWeight(signers: SignerEntry[], masterWeight?: number): number;
    static evaluateQuorum(signers: SignerEntry[], thresholds: AccountThresholds, masterWeight?: number): ThresholdEvaluation;
    static isSignatureSubsetSufficient(participatingKeys: string[], allSigners: SignerEntry[], requiredThreshold: number, masterKey?: string, masterWeight?: number): boolean;
}
//# sourceMappingURL=signer_weight_sum_calculator.d.ts.map