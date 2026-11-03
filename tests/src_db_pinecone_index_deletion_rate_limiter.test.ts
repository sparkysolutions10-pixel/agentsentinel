import { describe, it, expect } from 'vitest';
import { PineconeIndexDeletionRateLimiter } from '../src/db/pinecone_index_deletion_rate_limiter.js';

describe('PineconeIndexDeletionRateLimiter Invariant Suite (#1912)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PineconeIndexDeletionRateLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PINECONE_INDEX_DELETION_RATE_LIMITER');
    expect(PineconeIndexDeletionRateLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PineconeIndexDeletionRateLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PineconeIndexDeletionRateLimiter.validate('git status && npm run test')).toBe(true);
  });
});
