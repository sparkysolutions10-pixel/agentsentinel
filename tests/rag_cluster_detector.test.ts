import { describe, it, expect } from 'vitest';
import { createAdversarialClusterDetectorRule } from '../src/rag/adversarial_cluster_detector.js';
import { Verdict } from '../src/types.js';

describe('AdversarialClusterDetector', () => {
  const rule = createAdversarialClusterDetectorRule(5);

  it('allows safe batch upserts', () => {
    const violation = rule.evaluate({
      toolName: 'vector_upsert',
      params: { vectors: [[0.1, 0.2], [0.3, 0.4]], cluster: 'general' }
    });
    expect(violation).toBeNull();
  });

  it('blocks synthetic dense cluster collision flood', () => {
    const violation = rule.evaluate({
      toolName: 'vector_upsert',
      params: {
        vectors: Array(15).fill([0.1, 0.2]),
        forcedCollision: true
      }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
