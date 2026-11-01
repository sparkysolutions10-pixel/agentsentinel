import { describe, it, expect } from 'vitest';
import { createVectorCanaryRule } from '../src/rag/vector_canary_generator.js';
import { Verdict } from '../src/types.js';

describe('VectorCanaryHoneypot', () => {
  const rule = createVectorCanaryRule();

  it('allows access to legitimate document IDs', () => {
    const violation = rule.evaluate({ toolName: 'vector_fetch', params: { id: 'doc-item-1234' } });
    expect(violation).toBeNull();
  });

  it('blocks access to honeypot canary ID', () => {
    const violation = rule.evaluate({ toolName: 'vector_fetch', params: { id: '__canary_rag_honeypot_vector_99__' } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });
});
