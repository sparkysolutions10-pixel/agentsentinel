import { describe, it, expect } from 'vitest';
import { CosineSimilarityNanValueSanitizer } from '../src/db/cosine_similarity_nan_value_sanitizer.js';

describe('CosineSimilarityNanValueSanitizer Invariant Suite (#1917)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CosineSimilarityNanValueSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_COSINE_SIMILARITY_NAN_VALUE_SANITIZER');
    expect(CosineSimilarityNanValueSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CosineSimilarityNanValueSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CosineSimilarityNanValueSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
