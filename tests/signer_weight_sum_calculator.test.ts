import { describe, it, expect } from 'vitest';
import { SignerWeightSumCalculator } from '../src/utils/signer_weight_sum_calculator.js';

describe('SignerWeightSumCalculator', () => {
  const masterKey = 'G_MASTER';
  const signer1 = { key: 'G_SIGNER_1', weight: 10 };
  const signer2 = { key: 'G_SIGNER_2', weight: 15 };

  it('calculates total weight including master and additional signers', () => {
    const total = SignerWeightSumCalculator.calculateTotalWeight([signer1, signer2], 5);
    expect(total).toBe(30);
  });

  it('evaluates threshold satisfaction and locked status', () => {
    const thresholds = { lowThreshold: 10, medThreshold: 20, highThreshold: 30 };
    const evalResult = SignerWeightSumCalculator.evaluateQuorum([signer1, signer2], thresholds, 5);

    expect(evalResult.totalWeight).toBe(30);
    expect(evalResult.canSatisfyLow).toBe(true);
    expect(evalResult.canSatisfyMed).toBe(true);
    expect(evalResult.canSatisfyHigh).toBe(true);
    expect(evalResult.isLocked).toBe(false);
  });

  it('detects locked account when total weight < thresholds', () => {
    const thresholds = { lowThreshold: 10, medThreshold: 20, highThreshold: 40 };
    const evalResult = SignerWeightSumCalculator.evaluateQuorum([signer1], thresholds, 0);

    expect(evalResult.totalWeight).toBe(10);
    expect(evalResult.isLocked).toBe(true);
  });

  it('verifies whether signature subset is sufficient', () => {
    const signers = [signer1, signer2];
    const isSufficient = SignerWeightSumCalculator.isSignatureSubsetSufficient(
      ['G_SIGNER_1'],
      signers,
      20,
      masterKey,
      5
    );
    expect(isSufficient).toBe(false); // 10 < 20

    const isSufficientWithMaster = SignerWeightSumCalculator.isSignatureSubsetSufficient(
      ['G_MASTER', 'G_SIGNER_2'],
      signers,
      20,
      masterKey,
      5
    );
    expect(isSufficientWithMaster).toBe(true); // 5 + 15 = 20 >= 20
  });
});
