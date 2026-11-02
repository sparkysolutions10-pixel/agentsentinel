import { describe, it, expect } from 'vitest';
import { HybridCryptoWrapper } from '../src/crypto/hybrid_wrapper.js';

describe('Hybrid Classical and Quantum-Safe Wrapper (#819 & #820)', () => {
  it('combines classical and quantum secrets into single robust key', () => {
    const classical = Buffer.from('classical-ecdh-secret-bytes-32!!');
    const quantum = Buffer.from('post-quantum-kyber-secret-bytes!');

    const combined = HybridCryptoWrapper.combineKeys(classical, quantum);
    expect(combined.length).toBe(32);

    expect(HybridCryptoWrapper.verifyBoth(true, true)).toBe(true);
    expect(HybridCryptoWrapper.verifyBoth(true, false)).toBe(false);
  });
});
