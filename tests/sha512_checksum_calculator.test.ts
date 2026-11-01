import { describe, it, expect } from 'vitest';
import { Sha512ChecksumCalculator } from '../src/utils/sha512_checksum_calculator.js';

describe('Sha512ChecksumCalculator', () => {
  it('calculates accurate 128-char hex sha512 digest', () => {
    const digest = Sha512ChecksumCalculator.calculate('AgentSentinel Release');
    expect(digest.length).toBe(128);
    expect(Sha512ChecksumCalculator.verify('AgentSentinel Release', digest)).toBe(true);
    expect(Sha512ChecksumCalculator.verify('Tampered', digest)).toBe(false);
  });
});
