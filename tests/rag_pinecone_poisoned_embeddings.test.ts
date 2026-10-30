import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createPineconeQueryInterceptorRule } from '../src/rag/pinecone_interceptor.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Pinecone Poisoned Semantic Embeddings Adversarial Suite (#276)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createPineconeQueryInterceptorRule({ maxTopK: 100 }));

  it('blocks extreme floating-point overflow coordinates (1e309 -> Infinity)', async () => {
    const overflowCtx: ToolCallContext = {
      id: 'query_overflow',
      toolName: 'pinecone_query',
      params: {
        vector: [0.1, 1e309, 0.5], // 1e309 evaluates to Infinity in JS
        topK: 10,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(overflowCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Non-finite coordinates');
  });

  it('blocks negative floating-point overflow (-1e309 -> -Infinity)', async () => {
    const underflowCtx: ToolCallContext = {
      id: 'query_underflow',
      toolName: 'pinecone_query',
      params: {
        vector: [-1e309, 0.2, 0.3],
        topK: 10,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(underflowCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks nested multi-dimensional vector array poisoning attempts', async () => {
    const nestedCtx: ToolCallContext = {
      id: 'query_nested',
      toolName: 'vector_search',
      params: {
        vector: [0.1, [0.2, 0.3], 0.4] as any,
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(nestedCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks object injection within vector coordinate arrays', async () => {
    const objInjectCtx: ToolCallContext = {
      id: 'query_obj',
      toolName: 'similarity_search',
      params: {
        values: [0.1, { injected: true }, 0.5] as any,
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(objInjectCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks string coordinates masquerading as numbers', async () => {
    const strCoordCtx: ToolCallContext = {
      id: 'query_str',
      toolName: 'pinecone_query',
      params: {
        vector: [0.1, '0.555', 0.9] as any,
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(strCoordCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('allows high-dimensional clean normalized vector (1536 dims)', async () => {
    // Generate valid 1536-dimensional mock embedding
    const cleanVector = Array.from({ length: 1536 }, (_, i) => Math.sin(i) * 0.05);

    const validCtx: ToolCallContext = {
      id: 'query_clean_1536',
      toolName: 'pinecone_query',
      params: {
        vector: cleanVector,
        topK: 20,
        filter: { genre: { $eq: 'document' } },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(validCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
    expect(res.violations.length).toBe(0);
  });
});
