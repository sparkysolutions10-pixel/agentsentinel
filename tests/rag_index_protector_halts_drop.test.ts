import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createPineconeIndexProtectorRule } from '../src/rag/pinecone_index_protector.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Index Protector Halts Drop & Wipe Suite (#284)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createPineconeIndexProtectorRule());

  it('halts variants of vector collection drop tools across Chroma, Qdrant, and Milvus', async () => {
    const dropTools = [
      'chroma_delete_collection',
      'qdrant_delete_collection',
      'milvus_drop_collection',
      'pinecone_drop_index',
      'DROP_COLLECTION',
    ];

    for (const tool of dropTools) {
      const ctx: ToolCallContext = {
        id: `test_drop_${tool}`,
        toolName: tool,
        params: { collectionName: 'enterprise-knowledge-base' },
        timestamp: Date.now(),
      };

      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.violations[0].ruleId).toBe('rag-pinecone-index-protector');
    }
  });

  it('halts stringified deleteAll values ("true", "1")', async () => {
    const stringifiedTruthValues = ['true', 'TRUE'];

    for (const val of stringifiedTruthValues) {
      const ctx: ToolCallContext = {
        id: `test_wipe_${val}`,
        toolName: 'pinecone_delete',
        params: { deleteAll: val },
        timestamp: Date.now(),
      };

      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('halts uppercase and mixed-case tool naming evasions', async () => {
    const mixedCaseCalls = [
      'Pinecone_Delete_Index',
      'DELETEINDEX',
      'Wipe_Index',
    ];

    for (const tool of mixedCaseCalls) {
      const ctx: ToolCallContext = {
        id: `test_case_${tool}`,
        toolName: tool,
        params: { index: 'prod_vectors' },
        timestamp: Date.now(),
      };

      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('allows fine-grained document and vector deletions by ID', async () => {
    const safeDeleteCtx: ToolCallContext = {
      id: 'test_safe_del',
      toolName: 'pinecone_delete',
      params: {
        ids: ['vec_user_1', 'vec_user_2'],
        namespace: 'tenant-active',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeDeleteCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
    expect(res.violations.length).toBe(0);
  });
});
