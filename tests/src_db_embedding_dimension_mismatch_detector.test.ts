import { describe, it, expect } from 'vitest';
import { EmbeddingDimensionMismatchDetector } from '../src/db/embedding_dimension_mismatch_detector.js';

describe('EmbeddingDimensionMismatchDetector Invariant Suite (#1916)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = EmbeddingDimensionMismatchDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_EMBEDDING_DIMENSION_MISMATCH_DETECTOR');
    expect(EmbeddingDimensionMismatchDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = EmbeddingDimensionMismatchDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(EmbeddingDimensionMismatchDetector.validate('git status && npm run test')).toBe(true);
  });
});
