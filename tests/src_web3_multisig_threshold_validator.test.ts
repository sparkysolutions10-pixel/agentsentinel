import { describe, it, expect } from 'vitest';
import { MultisigThresholdValidator } from '../src/web3/multisig_threshold_validator.js';

describe('MultisigThresholdValidator Invariant Suite (#1756)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MultisigThresholdValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MULTISIG_THRESHOLD_VALIDATOR');
    expect(MultisigThresholdValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MultisigThresholdValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MultisigThresholdValidator.validate('git status && npm run test')).toBe(true);
  });
});
