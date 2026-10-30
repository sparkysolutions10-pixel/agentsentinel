import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  inspectPineconeQuery,
  createPineconeQueryInterceptorRule,
} from '../src/rag/pinecone_interceptor.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Pinecone Vector Query Interceptor (#275 & #276)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createPineconeQueryInterceptorRule({ maxTopK: 500 }));

  it('allows safe, legitimate vector queries with valid coordinates and reasonable topK', async () => {
    const safeCtx: ToolCallContext = {
      id: 'query_1',
      toolName: 'pinecone_query',
      params: {
        vector: [0.123, -0.456, 0.789, 0.001],
        topK: 10,
        includeMetadata: true,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('blocks queries with oversized topK attempting memory exhaustion DoS', async () => {
    const dosCtx: ToolCallContext = {
      id: 'query_dos',
      toolName: 'vector_search',
      params: {
        vector: [0.1, 0.2, 0.3],
        topK: 5000, // Exceeds ceiling 500
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(dosCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('rag-pinecone-query-interceptor');
    expect(res.violations[0].reason).toContain('exceeds configured security ceiling');
  });

  it('blocks poisoned vectors containing NaN coordinates', async () => {
    const nanCtx: ToolCallContext = {
      id: 'query_nan',
      toolName: 'pinecone_query',
      params: {
        vector: [0.1, NaN, 0.3],
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(nanCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Non-finite coordinates (NaN/Infinity) are prohibited');
  });

  it('blocks poisoned vectors containing Infinity or -Infinity coordinates', async () => {
    const infCtx: ToolCallContext = {
      id: 'query_inf',
      toolName: 'pinecone_query',
      params: {
        vector: [0.1, Infinity, 0.3],
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(infCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Non-finite coordinates');
  });

  it('blocks empty vector arrays (0 dimensions)', async () => {
    const emptyCtx: ToolCallContext = {
      id: 'query_empty',
      toolName: 'pinecone_query',
      params: {
        vector: [],
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(emptyCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Vector payload cannot be empty');
  });

  it('blocks non-array vector payload types (e.g. string or object injection)', async () => {
    const invalidTypeCtx: ToolCallContext = {
      id: 'query_invalid',
      toolName: 'pinecone_query',
      params: {
        vector: 'MALICIOUS_EMBEDDING_STRING',
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(invalidTypeCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('inspectPineconeQuery helper directly reports invalid topK types', () => {
    const inspection = inspectPineconeQuery({ topK: -5 });
    expect(inspection.isValid).toBe(false);
    expect(inspection.violationReason).toContain('Expected a positive integer');
  });
});
