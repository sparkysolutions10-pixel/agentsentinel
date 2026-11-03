import { describe, it, expect } from 'vitest';
import { ChargebackDisputeEvidenceBundler } from '../src/fintech/chargeback_dispute_evidence_bundler.js';

describe('ChargebackDisputeEvidenceBundler Invariant Suite (#1963)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ChargebackDisputeEvidenceBundler.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CHARGEBACK_DISPUTE_EVIDENCE_BUNDLER');
    expect(ChargebackDisputeEvidenceBundler.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ChargebackDisputeEvidenceBundler.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ChargebackDisputeEvidenceBundler.validate('git status && npm run test')).toBe(true);
  });
});
