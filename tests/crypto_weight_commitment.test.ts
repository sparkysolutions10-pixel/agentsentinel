import { describe, it, expect } from 'vitest';
import { ModelWeightCommitment } from '../src/crypto/weight_commitment.js';

describe('Model Weight Commitment Scheme (#811 & #812)', () => {
  it('detects modified weight checkpoints and validates authentic weights', () => {
    const genuine = Buffer.from('model-weights-layer-tensors-checkpoint');
    const commitment = ModelWeightCommitment.computeCommitment(genuine);

    expect(ModelWeightCommitment.verifyCommitment(genuine, commitment)).toBe(true);

    const tampered = Buffer.from('model-weights-layer-tensors-backdoor');
    expect(ModelWeightCommitment.verifyCommitment(tampered, commitment)).toBe(false);
  });
});
