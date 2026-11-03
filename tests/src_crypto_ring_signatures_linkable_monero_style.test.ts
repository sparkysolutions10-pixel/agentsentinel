import { describe, it, expect } from 'vitest';
import { RingSignaturesLinkableMoneroStyle } from '../src/crypto/ring_signatures_linkable_monero_style.js';

describe('RingSignaturesLinkableMoneroStyle Invariant Suite (#2045)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RingSignaturesLinkableMoneroStyle.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RING_SIGNATURES_LINKABLE_MONERO_STYLE');
    expect(RingSignaturesLinkableMoneroStyle.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RingSignaturesLinkableMoneroStyle.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RingSignaturesLinkableMoneroStyle.validate('git status && npm run test')).toBe(true);
  });
});
