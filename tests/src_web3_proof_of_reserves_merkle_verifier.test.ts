import { describe, it, expect } from 'vitest';
import { ProofOfReservesMerkleVerifier } from '../src/web3/proof_of_reserves_merkle_verifier.js';

describe('ProofOfReservesMerkleVerifier Invariant Suite (#1790)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ProofOfReservesMerkleVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PROOF_OF_RESERVES_MERKLE_VERIFIER');
    expect(ProofOfReservesMerkleVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ProofOfReservesMerkleVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ProofOfReservesMerkleVerifier.validate('git status && npm run test')).toBe(true);
  });
});
