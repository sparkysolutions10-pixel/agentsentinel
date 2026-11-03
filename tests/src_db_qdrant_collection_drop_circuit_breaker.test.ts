import { describe, it, expect } from 'vitest';
import { QdrantCollectionDropCircuitBreaker } from '../src/db/qdrant_collection_drop_circuit_breaker.js';

describe('QdrantCollectionDropCircuitBreaker Invariant Suite (#1911)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = QdrantCollectionDropCircuitBreaker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_QDRANT_COLLECTION_DROP_CIRCUIT_BREAKER');
    expect(QdrantCollectionDropCircuitBreaker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = QdrantCollectionDropCircuitBreaker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(QdrantCollectionDropCircuitBreaker.validate('git status && npm run test')).toBe(true);
  });
});
