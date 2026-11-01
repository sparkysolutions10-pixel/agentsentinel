import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createMilvusIndexMemoryControllerRule } from '../src/rag/milvus_index_controller.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Milvus Index Memory Controller (#321 & #322)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createMilvusIndexMemoryControllerRule());

  it('blocks excessive HNSW M parameter attempting cluster OOM', async () => {
    const oomCtx: ToolCallContext = {
      id: 'hnsw_oom',
      toolName: 'create_index',
      params: { extra_params: { M: 128, efConstruction: 200 } },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(oomCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds safe memory limit of 64');
  });

  it('allows safe HNSW index construction parameters', async () => {
    const safeCtx: ToolCallContext = {
      id: 'hnsw_safe',
      toolName: 'create_index',
      params: { extra_params: { M: 16, efConstruction: 64 } },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
