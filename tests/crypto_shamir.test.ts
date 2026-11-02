import { describe, it, expect } from 'vitest';
import { ShamirSecretSharing } from '../src/crypto/shamir_secret_sharing.js';

describe('Shamir Secret Sharing (#825 & #826)', () => {
  it('reconstructs secret from threshold shares and rejects fewer shares', () => {
    const secret = 1337;
    const shares = ShamirSecretSharing.splitSecret(secret, 5, 3);
    expect(shares.length).toBe(5);

    const reconstructed = ShamirSecretSharing.reconstructSecret([shares[0], shares[2], shares[4]]);
    expect(reconstructed).toBe(secret);

    expect(() => {
      ShamirSecretSharing.reconstructSecret([shares[0], shares[1]]);
    }).toThrow('Threshold not met');
  });
});
