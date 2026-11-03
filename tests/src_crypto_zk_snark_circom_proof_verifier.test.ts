import { describe, it, expect } from 'vitest';
import { ZkSnarkCircomProofVerifier } from '../src/crypto/zk_snark_circom_proof_verifier.js';

describe('ZkSnarkCircomProofVerifier Invariant Suite (#2014)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZkSnarkCircomProofVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZK_SNARK_CIRCOM_PROOF_VERIFIER');
    expect(ZkSnarkCircomProofVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZkSnarkCircomProofVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZkSnarkCircomProofVerifier.validate('git status && npm run test')).toBe(true);
  });
});
