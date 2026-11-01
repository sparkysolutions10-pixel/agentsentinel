import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createMilvusLifecycleGuardRule } from '../src/rag/milvus_lifecycle_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Milvus Lifecycle Guard (#317 & #318)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createMilvusLifecycleGuardRule());

  it('blocks drop partition attempts', async () => {
    const dropCtx: ToolCallContext = {
      id: 'milvus_drop_1',
      toolName: 'milvus_drop_partition',
      params: { partition: 'tenant_alpha' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(dropCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Destructive drop partition');
  });

  it('allows safe query operations', async () => {
    const safeCtx: ToolCallContext = {
      id: 'milvus_safe_1',
      toolName: 'milvus_query',
      params: { collection: 'docs' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
