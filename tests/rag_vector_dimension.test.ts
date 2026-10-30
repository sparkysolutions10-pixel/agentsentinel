import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  inspectVectorDimensions,
  createVectorDimensionGuardRule,
} from '../src/rag/vector_dimension_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Vector Dimension Mismatch Guard (#277 & #278)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(
    createVectorDimensionGuardRule({
      expectedDimensions: 1536,
      maxDimensionLimit: 4096,
      indexDimensionMap: {
        'bert-embeddings': 768,
        'clip-images': 512,
      },
    })
  );

  it('allows vector query with exact expected dimensions (1536)', async () => {
    const validVector = Array(1536).fill(0.01);
    const ctx: ToolCallContext = {
      id: 'dim_ok',
      toolName: 'vector_search',
      params: { vector: validVector },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(ctx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('blocks truncated vector (e.g. 512 dimensions instead of 1536)', async () => {
    const truncatedVector = Array(512).fill(0.01);
    const ctx: ToolCallContext = {
      id: 'dim_truncated',
      toolName: 'pinecone_query',
      params: { vector: truncatedVector },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(ctx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Received 512 dimensions, expected 1536');
  });

  it('blocks oversized vector exceeding maxDimensionLimit', async () => {
    const hugeVector = Array(5000).fill(0.01);
    const ctx: ToolCallContext = {
      id: 'dim_huge',
      toolName: 'pinecone_query',
      params: { vector: hugeVector },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(ctx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds safe maximum limit (4096)');
  });

  it('enforces index-specific dimensions from indexDimensionMap', async () => {
    // bert-embeddings index expects 768
    const bertVec = Array(768).fill(0.02);
    const validBertCtx: ToolCallContext = {
      id: 'bert_ok',
      toolName: 'query_vectors',
      params: { indexName: 'bert-embeddings', vector: bertVec },
      timestamp: Date.now(),
    };
    const validRes = await engine.evaluate(validBertCtx);
    expect(validRes.allowed).toBe(true);

    // Mismatched bert embedding with 1536 dims should be blocked
    const wrongBertVec = Array(1536).fill(0.02);
    const invalidBertCtx: ToolCallContext = {
      id: 'bert_mismatch',
      toolName: 'query_vectors',
      params: { indexName: 'bert-embeddings', vector: wrongBertVec },
      timestamp: Date.now(),
    };
    const invalidRes = await engine.evaluate(invalidBertCtx);
    expect(invalidRes.allowed).toBe(false);
    expect(invalidRes.violations[0].reason).toContain('expected 768');
  });

  it('validates batch document vectors inside documents array', async () => {
    const validDocVec = Array(1536).fill(0.01);
    const invalidDocVec = Array(256).fill(0.01);

    const batchCtx: ToolCallContext = {
      id: 'batch_docs',
      toolName: 'upsert_vectors',
      params: {
        documents: [
          { id: 'doc_1', vector: validDocVec },
          { id: 'doc_2', vector: invalidDocVec }, // Mismatched!
        ],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(batchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Received 256 dimensions, expected 1536');
  });

  it('supports allowedDimensions array for multi-model configurations', () => {
    const multiInspection = inspectVectorDimensions(
      { vector: Array(768).fill(0.1) },
      { expectedDimensions: [384, 768, 1536] }
    );
    expect(multiInspection.hasDimensionIssue).toBe(false);

    const failInspection = inspectVectorDimensions(
      { vector: Array(100).fill(0.1) },
      { expectedDimensions: [384, 768, 1536] }
    );
    expect(failInspection.hasDimensionIssue).toBe(true);
    expect(failInspection.reason).toContain('expected one of [384, 768, 1536]');
  });
});
