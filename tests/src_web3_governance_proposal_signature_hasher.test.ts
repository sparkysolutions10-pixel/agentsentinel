import { describe, it, expect } from 'vitest';
import { GovernanceProposalSignatureHasher } from '../src/web3/governance_proposal_signature_hasher.js';

describe('GovernanceProposalSignatureHasher Invariant Suite (#1773)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GovernanceProposalSignatureHasher.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GOVERNANCE_PROPOSAL_SIGNATURE_HASHER');
    expect(GovernanceProposalSignatureHasher.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GovernanceProposalSignatureHasher.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GovernanceProposalSignatureHasher.validate('git status && npm run test')).toBe(true);
  });
});
