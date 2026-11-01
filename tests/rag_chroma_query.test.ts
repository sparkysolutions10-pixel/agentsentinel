import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  inspectChromaQuery,
  createChromaQueryInterceptorRule,
} from '../src/rag/chroma_interceptor.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('ChromaDB Vector Query Interceptor (#295 & #296)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createChromaQueryInterceptorRule({ maxNResults: 500 }));

  it('allows safe legitimate ChromaDB collection queries', async () => {
    const safeCtx: ToolCallContext = {
      id: 'chroma_safe_1',
      toolName: 'chroma_query_collection',
      params: {
        query_texts: ['search query for agent docs'],
        n_results: 10,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('blocks oversized n_results attempting memory exhaustion DoS', async () => {
    const dosCtx: ToolCallContext = {
      id: 'chroma_dos_1',
      toolName: 'chroma_query',
      params: {
        query_texts: ['search query'],
        n_results: 100000,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(dosCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('rag-chroma-query-interceptor');
    expect(res.violations[0].reason).toContain('exceeds configured security ceiling');
  });

  it('blocks malformed query_texts containing null-byte injections', async () => {
    const nullCtx: ToolCallContext = {
      id: 'chroma_null_1',
      toolName: 'collection_query',
      params: {
        query_texts: ['malicious\0string'],
        n_results: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(nullCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Null-byte string detected');
  });

  it('blocks giant string buffers exceeding 64KB ceiling', async () => {
    const giantText = 'A'.repeat(70000);
    const giantCtx: ToolCallContext = {
      id: 'chroma_giant_1',
      toolName: 'chromadb_search',
      params: {
        query_texts: [giantText],
        n_results: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(giantCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum allowable length');
  });

  it('directly validates inspectChromaQuery with negative or invalid n_results', () => {
    const inspectRes = inspectChromaQuery({ n_results: -10 });
    expect(inspectRes.isValid).toBe(false);
    expect(inspectRes.violationReason).toContain('Expected a positive integer');
  });
});
