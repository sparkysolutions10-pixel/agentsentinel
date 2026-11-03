import { describe, it, expect } from 'vitest';
import { SignatureMalleabilityDetector } from '../src/web3/signature_malleability_detector.js';

describe('SignatureMalleabilityDetector Invariant Suite (#1800)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SignatureMalleabilityDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SIGNATURE_MALLEABILITY_DETECTOR');
    expect(SignatureMalleabilityDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SignatureMalleabilityDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SignatureMalleabilityDetector.validate('git status && npm run test')).toBe(true);
  });
});
