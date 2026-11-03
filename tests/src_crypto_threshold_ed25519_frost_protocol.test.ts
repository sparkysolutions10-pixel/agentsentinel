import { describe, it, expect } from 'vitest';
import { ThresholdEd25519FrostProtocol } from '../src/crypto/threshold_ed25519_frost_protocol.js';

describe('ThresholdEd25519FrostProtocol Invariant Suite (#2047)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ThresholdEd25519FrostProtocol.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_THRESHOLD_ED25519_FROST_PROTOCOL');
    expect(ThresholdEd25519FrostProtocol.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ThresholdEd25519FrostProtocol.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ThresholdEd25519FrostProtocol.validate('git status && npm run test')).toBe(true);
  });
});
