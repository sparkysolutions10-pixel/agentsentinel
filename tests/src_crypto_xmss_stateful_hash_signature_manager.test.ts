import { describe, it, expect } from 'vitest';
import { XmssStatefulHashSignatureManager } from '../src/crypto/xmss_stateful_hash_signature_manager.js';

describe('XmssStatefulHashSignatureManager Invariant Suite (#2007)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = XmssStatefulHashSignatureManager.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_XMSS_STATEFUL_HASH_SIGNATURE_MANAGER');
    expect(XmssStatefulHashSignatureManager.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = XmssStatefulHashSignatureManager.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(XmssStatefulHashSignatureManager.validate('git status && npm run test')).toBe(true);
  });
});
