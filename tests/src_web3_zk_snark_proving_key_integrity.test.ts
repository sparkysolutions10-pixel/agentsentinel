import { describe, it, expect } from 'vitest';
import { ZkSnarkProvingKeyIntegrity } from '../src/web3/zk_snark_proving_key_integrity.js';

describe('ZkSnarkProvingKeyIntegrity Invariant Suite (#1793)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZkSnarkProvingKeyIntegrity.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZK_SNARK_PROVING_KEY_INTEGRITY');
    expect(ZkSnarkProvingKeyIntegrity.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZkSnarkProvingKeyIntegrity.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZkSnarkProvingKeyIntegrity.validate('git status && npm run test')).toBe(true);
  });
});
