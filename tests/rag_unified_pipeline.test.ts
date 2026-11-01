import { describe, it, expect } from 'vitest';
import { createUnifiedRagPipelineRule } from '../src/rag/unified_rag_pipeline.js';
import { Verdict } from '../src/types.js';

describe('UnifiedRagPipeline', () => {
  const rule = createUnifiedRagPipelineRule();

  it('allows standard pipeline execution', () => {
    const violation = rule.evaluate({ toolName: 'rag_execute', params: { stage: 'retrieve', query: 'docs' } });
    expect(violation).toBeNull();
  });

  it('blocks execution attempting to skip validation', () => {
    const violation = rule.evaluate({ toolName: 'rag_execute', params: { stage: 'retrieve', skipValidation: true } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
