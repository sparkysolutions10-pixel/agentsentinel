import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  inspectIndexDeletion,
  createPineconeIndexProtectorRule,
} from '../src/rag/pinecone_index_protector.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Pinecone Index Deletion & Wipe Protector (#283 & #284)', () => {
  it('blocks deleteIndex tool call targeting a vector index', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createPineconeIndexProtectorRule());

    const deleteCtx: ToolCallContext = {
      id: 'del_idx_1',
      toolName: 'pinecone_delete_index',
      params: { indexName: 'production-enterprise-kb' },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(deleteCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('rag-pinecone-index-protector');
    expect(res.violations[0].reason).toContain('Entire vector store destruction is prohibited');
  });

  it('blocks unconstrained bulk wipe operations with deleteAll: true', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createPineconeIndexProtectorRule());

    const wipeCtx: ToolCallContext = {
      id: 'wipe_all_1',
      toolName: 'pinecone_delete',
      params: {
        namespace: 'customer-docs',
        deleteAll: true,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(wipeCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unconstrained vector wipe ("deleteAll: true") intercepted');
  });

  it('downgrades to CONFIRM verdict when requireConfirmation is enabled', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createPineconeIndexProtectorRule({ requireConfirmation: true }));

    const confirmCtx: ToolCallContext = {
      id: 'del_confirm',
      toolName: 'deleteIndex',
      params: { name: 'dev-sandbox-index' },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(confirmCtx);
    expect(res.verdict).toBe(Verdict.CONFIRM);
    expect(res.violations[0].reason.toLowerCase()).toContain('requires interactive confirmation');
  });

  it('respects protectedIndices allowlist boundary', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(
      createPineconeIndexProtectorRule({
        protectedIndices: ['prod-financials', 'prod-hr'],
      })
    );

    // Deleting protected index -> BLOCK
    const protectedCtx: ToolCallContext = {
      id: 'del_prod',
      toolName: 'delete_index',
      params: { index: 'prod-financials' },
      timestamp: Date.now(),
    };
    const prodRes = await engine.evaluate(protectedCtx);
    expect(prodRes.allowed).toBe(false);
    expect(prodRes.verdict).toBe(Verdict.BLOCK);

    // Deleting temporary scratch index -> ALLOW
    const scratchCtx: ToolCallContext = {
      id: 'del_scratch',
      toolName: 'delete_index',
      params: { index: 'temp-scratch-experiment' },
      timestamp: Date.now(),
    };
    const scratchRes = await engine.evaluate(scratchCtx);
    expect(scratchRes.allowed).toBe(true);
    expect(scratchRes.verdict).toBe(Verdict.ALLOW);
  });

  it('allows safe legitimate query and upsert operations', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createPineconeIndexProtectorRule());

    const safeCalls: ToolCallContext[] = [
      { id: 'safe_q', toolName: 'pinecone_query', params: { topK: 10 }, timestamp: Date.now() },
      { id: 'safe_u', toolName: 'pinecone_upsert', params: { vectors: [] }, timestamp: Date.now() },
      { id: 'safe_d', toolName: 'pinecone_delete', params: { ids: ['doc_123'] }, timestamp: Date.now() },
    ];

    for (const call of safeCalls) {
      const res = await engine.evaluate(call);
      expect(res.allowed).toBe(true);
      expect(res.verdict).toBe(Verdict.ALLOW);
    }
  });
});
