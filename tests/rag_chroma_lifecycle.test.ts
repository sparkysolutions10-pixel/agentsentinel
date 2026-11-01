import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createChromaLifecycleProtectorRule } from '../src/rag/chroma_lifecycle.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('ChromaDB Lifecycle Protector (#299 & #300)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createChromaLifecycleProtectorRule({ protectedCollections: ['prod_knowledge'] }));

  it('blocks tool call chroma_reset attempting total local database wipe', async () => {
    const wipeCtx: ToolCallContext = {
      id: 'chroma_wipe_1',
      toolName: 'chroma_reset',
      params: {},
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(wipeCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('database reset operation is prohibited');
  });

  it('blocks deletion of protected collections', async () => {
    const delCtx: ToolCallContext = {
      id: 'chroma_del_1',
      toolName: 'delete_collection',
      params: {
        collection_name: 'prod_knowledge',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(delCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Destructive deletion of ChromaDB collection');
  });

  it('allows safe query and document addition operations', async () => {
    const safeCtx: ToolCallContext = {
      id: 'chroma_safe_1',
      toolName: 'chroma_query',
      params: {
        query_texts: ['hello world'],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
