import { describe, it, expect } from 'vitest';
import { HybridX25519Mlkem768KeyExchange } from '../src/crypto/hybrid_x25519_mlkem768_key_exchange.js';

describe('HybridX25519Mlkem768KeyExchange Invariant Suite (#2011)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HybridX25519Mlkem768KeyExchange.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HYBRID_X25519_MLKEM768_KEY_EXCHANGE');
    expect(HybridX25519Mlkem768KeyExchange.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HybridX25519Mlkem768KeyExchange.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HybridX25519Mlkem768KeyExchange.validate('git status && npm run test')).toBe(true);
  });
});
