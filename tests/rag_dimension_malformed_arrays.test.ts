import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createVectorDimensionGuardRule } from '../src/rag/vector_dimension_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Vector Dimension Malformed Arrays Rejection Suite (#278)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(
    createVectorDimensionGuardRule({
      expectedDimensions: 1536,
      maxDimensionLimit: 2048,
    })
  );

  it('rejects empty vector array (0 dimensions)', async () => {
    const emptyCtx: ToolCallContext = {
      id: 'test_empty',
      toolName: 'pinecone_query',
      params: { vector: [] },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(emptyCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('0 dimensions');
  });

  it('rejects single-element vector array when 1536 is expected', async () => {
    const singleCtx: ToolCallContext = {
      id: 'test_single',
      toolName: 'pinecone_query',
      params: { vector: [0.42] },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(singleCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Received 1 dimensions, expected 1536');
  });

  it('rejects batch upsert with one empty vector amongst 5 valid vectors', async () => {
    const validVec = Array(1536).fill(0.01);
    const mixedBatchCtx: ToolCallContext = {
      id: 'test_mixed_batch',
      toolName: 'upsert_vectors',
      params: {
        vectors: [validVec, validVec, [], validVec, validVec],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(mixedBatchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('0 dimensions');
  });

  it('rejects extreme dimensions (30000 dims) attempting memory crash', async () => {
    const extremeVec = Array(5000).fill(0.01);
    const extremeCtx: ToolCallContext = {
      id: 'test_extreme',
      toolName: 'vector_search',
      params: { vector: extremeVec },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(extremeCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds safe maximum limit (2048)');
  });

  it('allows clean valid embeddings matching expected 1536 dimensions', async () => {
    const validVec = Array(1536).fill(0.01);
    const validCtx: ToolCallContext = {
      id: 'test_valid',
      toolName: 'pinecone_query',
      params: { vector: validVec, topK: 10 },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(validCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
