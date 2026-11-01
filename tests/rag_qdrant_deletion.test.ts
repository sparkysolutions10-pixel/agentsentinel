import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createQdrantPointDeletionGuardRule } from '../src/rag/qdrant_deletion_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Qdrant Point Deletion Guard (#311 & #312)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createQdrantPointDeletionGuardRule({ maxBatchDeletePoints: 100 }));

  it('blocks mass point deletion using filter selector', async () => {
    const filterDelCtx: ToolCallContext = {
      id: 'del_filt_1',
      toolName: 'delete_points',
      params: {
        filter: {
          must: [{ key: 'status', match: { value: 'archived' } }],
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(filterDelCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Mass point deletion via arbitrary filter selector is prohibited');
  });

  it('blocks batch deletion exceeding point count limit', async () => {
    const largeBatch = Array.from({ length: 150 }, (_, i) => `point_${i}`);
    const batchCtx: ToolCallContext = {
      id: 'del_batch_1',
      toolName: 'delete_points',
      params: {
        points: largeBatch,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(batchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds safety limit of 100');
  });

  it('allows safe deletion of few targeted points', async () => {
    const safeCtx: ToolCallContext = {
      id: 'del_safe_1',
      toolName: 'delete_points',
      params: {
        points: ['doc_1', 'doc_2'],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
