import { describe, it, expect } from 'vitest';
import { X25519KeyAgreement } from '../src/crypto/x25519_agreement.js';

describe('Ephemeral ECDH X25519 Key Agreement (#869 & #870)', () => {
  it('generates unique keys and computes identical shared secret across agent pairs', () => {
    const alice = X25519KeyAgreement.generateKeyPair();
    const bob = X25519KeyAgreement.generateKeyPair();

    const secretAlice = X25519KeyAgreement.computeSharedSecret(alice.privateKey, bob.publicKey);
    const secretBob = X25519KeyAgreement.computeSharedSecret(bob.privateKey, alice.publicKey);

    expect(secretAlice.length).toBe(32);
    expect(secretAlice.equals(secretBob)).toBe(true);

    const charlie = X25519KeyAgreement.generateKeyPair();
    const secretCharlie = X25519KeyAgreement.computeSharedSecret(charlie.privateKey, bob.publicKey);
    expect(secretAlice.equals(secretCharlie)).toBe(false);
  });
});
