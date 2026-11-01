import { describe, it, expect } from 'vitest';
import { createDegenerateVectorFilterRule } from '../src/rag/degenerate_vector_filter.js';
import { Verdict } from '../src/types.js';

describe('DegenerateVectorFilter', () => {
  const rule = createDegenerateVectorFilterRule();

  it('allows natural non-zero embeddings', () => {
    const violation = rule.evaluate({ toolName: 'embed', params: { vector: [0.1, 0.4, -0.3, 0.8] } });
    expect(violation).toBeNull();
  });

  it('blocks all-zero vectors', () => {
    const violation = rule.evaluate({ toolName: 'embed', params: { vector: [0, 0, 0, 0, 0] } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks uniform constant vectors', () => {
    const violation = rule.evaluate({ toolName: 'embed', params: { embedding: [0.5, 0.5, 0.5, 0.5, 0.5] } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
