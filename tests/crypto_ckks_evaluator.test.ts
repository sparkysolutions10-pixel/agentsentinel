import { describe, it, expect } from 'vitest';
import { CKKSEmbeddingEvaluator } from '../src/crypto/ckks_evaluator.js';

describe('CKKS Homomorphic Encryption Evaluator (#835 & #836)', () => {
  it('computes approximate cosine similarity on encrypted vectors within 1e-4 tolerance', () => {
    const v1 = [0.1, 0.2, 0.3, 0.4];
    const v2 = [0.1, 0.2, 0.3, 0.4]; // Identical -> Cosine = 1.0

    const enc = CKKSEmbeddingEvaluator.computeEncryptedCosineSimilarity(v1, v2);
    const decrypted = CKKSEmbeddingEvaluator.decryptScore(enc);

    expect(Math.abs(decrypted - 1.0)).toBeLessThan(1e-4);
  });
});
