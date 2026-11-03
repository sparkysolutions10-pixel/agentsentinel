import { describe, it, expect } from 'vitest';
import { RagChunkOverlapBoundaryClamp } from '../src/db/rag_chunk_overlap_boundary_clamp.js';

describe('RagChunkOverlapBoundaryClamp Invariant Suite (#1945)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RagChunkOverlapBoundaryClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RAG_CHUNK_OVERLAP_BOUNDARY_CLAMP');
    expect(RagChunkOverlapBoundaryClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RagChunkOverlapBoundaryClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RagChunkOverlapBoundaryClamp.validate('git status && npm run test')).toBe(true);
  });
});
