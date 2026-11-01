import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createChromaBatchSizeLimiterRule } from '../src/rag/chroma_batch_limiter.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('ChromaDB Batch Size Limiter (#301 & #302)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createChromaBatchSizeLimiterRule({ maxDocuments: 500, maxPayloadBytes: 10 * 1024 * 1024 }));

  it('blocks batch exceeding document count ceiling', async () => {
    const hugeDocs = Array.from({ length: 5001 }, (_, i) => `doc_${i}`);
    const batchCtx: ToolCallContext = {
      id: 'batch_docs_1',
      toolName: 'chroma_add',
      params: {
        documents: hugeDocs,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(batchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum limit of 500');
  });

  it('blocks batch exceeding 10MB payload size ceiling', async () => {
    const hugeDoc = 'x'.repeat(11 * 1024 * 1024);
    const batchCtx: ToolCallContext = {
      id: 'batch_bytes_1',
      toolName: 'upsert_documents',
      params: {
        documents: [hugeDoc],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(batchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum limit of 10.00MB');
  });

  it('allows compliant batch under 500 documents and 10MB', async () => {
    const compliantCtx: ToolCallContext = {
      id: 'batch_ok_1',
      toolName: 'chroma_add',
      params: {
        documents: ['safe doc 1', 'safe doc 2'],
        ids: ['id1', 'id2'],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(compliantCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
