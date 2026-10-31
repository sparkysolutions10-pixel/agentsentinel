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

export class SignerWeightSumCalculator {
  public static calculateTotalWeight(signers: SignerEntry[], masterWeight: number = 1): number {
    let sum = Math.max(0, masterWeight);
    for (const s of signers) {
      if (s.weight > 0) {
        sum += s.weight;
      }
    }
    return sum;
  }

  public static evaluateQuorum(
    signers: SignerEntry[],
    thresholds: AccountThresholds,
    masterWeight: number = 1
  ): ThresholdEvaluation {
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

  public static isSignatureSubsetSufficient(
    participatingKeys: string[],
    allSigners: SignerEntry[],
    requiredThreshold: number,
    masterKey?: string,
    masterWeight: number = 1
  ): boolean {
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
