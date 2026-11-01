import { describe, it, expect } from 'vitest';
import { EntropyCalculator } from '../src/utils/entropy_calculator.js';

describe('EntropyCalculator', () => {
  it('detects high entropy strings like random keys', () => {
    const high = 'xK9#vL2$mQ8@pT1%';
    const low = 'aaaaaaaaaaaaaaaa';
    expect(EntropyCalculator.calculateShannonEntropy(low)).toBe(0);
    expect(EntropyCalculator.calculateShannonEntropy(high)).toBeGreaterThan(3.5);
    expect(EntropyCalculator.isHighEntropy(high, 3.5)).toBe(true);
  });
});
